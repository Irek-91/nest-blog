import mongoose, { ObjectId } from "mongoose";
import bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';
import add from 'date-fns/add'
import { UsersRepository } from 'src/users/users.repo';
import { UsersQueryRepository } from 'src/users/users.qurey.repo';
import { userViewModel } from 'src/users/models/users-model';
import { User } from 'src/users/models/users-schema';
import { EmailAdapter } from "src/application/email-adapter";


export class AuthService {
    constructor(protected userRepository: UsersRepository,
        protected usersQueryRepository: UsersQueryRepository,
        protected emailAdapter: EmailAdapter) {}

    async creatUser(login: string, password: string, email: string): Promise<userViewModel | null> {
        const createdAt = new Date().toISOString();
        const passwordSalt = await bcrypt.genSalt(10)
        const passwordHash = await this._generateHash(password, passwordSalt)

        const newUser: User = {
            _id: new ObjectId(),
            accountData: {
                login: login,
                email: email,
                salt: passwordSalt,
                hash: passwordHash,
                createdAt: createdAt
            },
            emailConfirmation: {
                confirmationCode: uuidv4(),
                expiritionDate: add(new Date(), {
                    hours: 1,
                    minutes: 3
                }),
                isConfirmed: false,
                recoveryCode: uuidv4()
            }
        }

        const creatresult = await this.userRepository.createUser(newUser)
        try {
            await this.emailAdapter.sendEmail(newUser.accountData.email, 'code', newUser.emailConfirmation.confirmationCode)
        } catch (e) {
            //const idNewUser = await userRepository.findByLoginOrEmailL(newUser.accountData.email)
            //if (idNewUser) {
            //const deleteNewUser = await userRepository.deleteUserId(idNewUser._id.toString())}
            return null
        }
        return creatresult
    }

    async _generateHash(password: string, salt: string) {
        const hash = await bcrypt.hash(password, salt)
        return hash;
    }

    async confirmationCode(code: string): Promise<boolean> {
        let user = await this.usersQueryRepository.findUserByCode(code)
        if (!user) return false
        if (user.emailConfirmation.isConfirmed === true) return false
        if (user.emailConfirmation.confirmationCode !== code) return false
        if (user.emailConfirmation.expiritionDate < new Date()) return false

        let result = await this.userRepository.updateConfirmation(user._id)
        return result
    }

    async resendingEmail(email: string): Promise<null | boolean> {
        let user = await this.usersQueryRepository.findUserByEmail(email)
        if (user === null) return false
        if (user.emailConfirmation.isConfirmed === true) return false

        const confirmationCode = uuidv4();
        const expiritionDate = add(new Date(), {
            hours: 1,
            minutes: 2
        })
        await this.userRepository.updateCode(user._id, confirmationCode, expiritionDate)
        await this.emailAdapter.sendEmail(user.accountData.email, 'code', confirmationCode)
        return true
    }


    async passwordRecovery(email: string): Promise<true> {
        let user = await this.usersQueryRepository.findUserByEmail(email)
        if (user === null) return true

        const recoveryCode = uuidv4();
        await this.userRepository.updateRecoveryCode(user._id, recoveryCode)
        await this.emailAdapter.passwordRecovery(user.accountData.email, 'code', recoveryCode)
        return true
    }


    async newPassword(newPassword: string, recoveryCode: string): Promise<boolean> {

        let result = await this.usersQueryRepository.findUserByRecoveryCode(recoveryCode)
        if (result === null) { return false }

        const passwordSalt = await bcrypt.genSalt(10)
        const passwordHash = await this._generateHash(newPassword, passwordSalt)
        const resultUpdatePassword = await this.userRepository.updatePassword(result._id, passwordSalt, passwordHash)
        if (resultUpdatePassword === false) { return false }
        return true
    }
}