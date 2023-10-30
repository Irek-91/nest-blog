import { EmailAdapter } from './../application/email-adapter';
import { User } from './../users/models/users-schema';
import { userViewModel } from './../users/models/users-model';
import { UsersQueryRepository } from './../users/users.qurey.repo';
import { UsersRepository } from './../users/users.repo';
import mongoose, { ObjectId } from "mongoose";
import bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';
import add from 'date-fns/add'
import { Controller, Get, Query, HttpException, HttpStatus, Param, Post, Body, Put, Delete, UseGuards, Injectable } from '@nestjs/common';
import { log } from "console";

@Injectable()
export class AuthService {
    constructor(protected userRepository: UsersRepository,
        protected usersQueryRepository: UsersQueryRepository,
        protected emailAdapter: EmailAdapter) {}

    async creatUser(login: string, password: string, email: string): Promise<userViewModel | null> {
        // const userFindByEmail = await this.usersQueryRepository.findByLoginOrEmailL(email)
        // const userFindByLogin = await this.usersQueryRepository.findByLoginOrEmailL(login)

        const createdAt = new Date().toISOString();
        const passwordSalt = await bcrypt.genSalt(10)
        const passwordHash = await this._generateHash(password, passwordSalt)

        const newUser: User = {
            _id: new mongoose.Types.ObjectId(),
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

    async confirmationCode(code: string): Promise<HttpStatus.NO_CONTENT | HttpStatus.BAD_REQUEST> {
        let user = await this.usersQueryRepository.findUserByCode(code)
        if (user === HttpStatus.BAD_REQUEST) {return HttpStatus.BAD_REQUEST}
        if (user.emailConfirmation.isConfirmed === true) return HttpStatus.BAD_REQUEST
        if (user.emailConfirmation.confirmationCode !== code) return HttpStatus.BAD_REQUEST
        if (user.emailConfirmation.expiritionDate < new Date()) return HttpStatus.BAD_REQUEST

        let result = await this.userRepository.updateConfirmation(user._id)

        return HttpStatus.NO_CONTENT
    }

    async resendingEmail(email: string): Promise<HttpStatus.NO_CONTENT | HttpStatus.BAD_REQUEST> {
        let user = await this.usersQueryRepository.findUserByEmail(email)
        if (user === HttpStatus.NOT_FOUND) return HttpStatus.BAD_REQUEST
        if (user.emailConfirmation.isConfirmed === true) return HttpStatus.BAD_REQUEST

        const confirmationCode = uuidv4();
        const expiritionDate = add(new Date(), {
            hours: 1,
            minutes: 2
        })
        await this.userRepository.updateCode(user._id, confirmationCode, expiritionDate)
        await this.emailAdapter.sendEmail(user.accountData.email, 'code', confirmationCode)
        return HttpStatus.NO_CONTENT
    }


    async passwordRecovery(email: string): Promise<HttpStatus.BAD_REQUEST | HttpStatus.NO_CONTENT> {
        let user = await this.usersQueryRepository.findUserByEmail(email)
        if (user === HttpStatus.NOT_FOUND) return HttpStatus.BAD_REQUEST

        const recoveryCode = uuidv4();
        await this.userRepository.updateRecoveryCode(user._id, recoveryCode)
        await this.emailAdapter.passwordRecovery(user.accountData.email, 'code', recoveryCode)
        return HttpStatus.NO_CONTENT
    }


    async newPassword(newPassword: string, recoveryCode: string): Promise< HttpStatus.NO_CONTENT | HttpStatus.BAD_REQUEST | HttpStatus.NOT_FOUND> {

        let result = await this.usersQueryRepository.findUserByRecoveryCode(recoveryCode)
        if (result === HttpStatus.NOT_FOUND) { return HttpStatus.NOT_FOUND }

        const passwordSalt = await bcrypt.genSalt(10)
        const passwordHash = await this._generateHash(newPassword, passwordSalt)
        const resultUpdatePassword = await this.userRepository.updatePassword(result._id, passwordSalt, passwordHash)
        if (resultUpdatePassword === false) { return HttpStatus.BAD_REQUEST }
        return HttpStatus.NO_CONTENT
    }
}