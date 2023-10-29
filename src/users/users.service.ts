import { MeViewModel, userViewModel } from 'src/users/models/users-model';
import { HttpStatus, Injectable } from "@nestjs/common";
import { UsersRepository } from "./users.repo";
import { add } from 'date-fns';
import { v4 as uuidv4 } from 'uuid';
import mongoose, { ObjectId } from "mongoose";
import bcrypt from 'bcrypt'
import { CreatUserInputModel } from './models/users-model';
import { QueryPaginationTypeUser } from 'src/helpers/query-filter';
import { UsersQueryRepository } from "./users.qurey.repo";
import { UserDocument } from "./models/users-schema";
import { log } from 'console';

@Injectable()
export class UsersService {
  constructor(protected usersRepository: UsersRepository,
    protected usersQueryRepository: UsersQueryRepository) { }

  async findUsers(paginationQuery: QueryPaginationTypeUser) {
    return await this.usersQueryRepository.findUsers(paginationQuery)
  }

  async createUser(inputModel: CreatUserInputModel) {
    const userCheck: UserDocument | HttpStatus.NOT_FOUND = await this.usersQueryRepository.findUserByEmail(inputModel.email)
    if (userCheck !==HttpStatus.NOT_FOUND) {
      return HttpStatus.BAD_REQUEST;
    }
    const createdAt = new Date().toISOString();
    const passwordSalt = await bcrypt.genSalt(10)
    const passwordHash = await this._generateHash(inputModel.password, passwordSalt)
    const confirmationCode = uuidv4()
    const recoveryCode = uuidv4()
    const isConfirmed = false
    const expiritionDate = (add(new Date(), {
      hours: 1,
      minutes: 3
    })).toISOString()

    const newUser = {
      _id: new mongoose.Types.ObjectId(),
      accountData: {
        login: inputModel.login,
        email: inputModel.email,
        salt: passwordSalt,
        hash: passwordHash,
        createdAt
      },
      emailConfirmation: {
        confirmationCode,
        expiritionDate,
        isConfirmed,
        recoveryCode
      }
    }

    return await this.usersRepository.createUser(newUser)
  }

  async deleteUserId(id: string): Promise<HttpStatus.NO_CONTENT | HttpStatus.NOT_FOUND> {
    return await this.usersRepository.deleteUserId(id)
  }

async deleteUsers(): Promise<HttpStatus.NO_CONTENT | HttpStatus.NOT_FOUND> {
    return await this.usersRepository.deleteUsers()
  }

  async _generateHash(password: string, salt: string) {
    const hash = await bcrypt.hash(password, salt)
    return hash;
  }

    async checkCredentials(loginOrEmail: string, passwordUser: string): Promise<UserDocument | HttpStatus.NOT_FOUND> {
      const user = await  this.usersQueryRepository.findByLoginOrEmailL(loginOrEmail)
      if (user === HttpStatus.NOT_FOUND) {
        return HttpStatus.NOT_FOUND
      }
      const passwordHash = await this._generateHash(passwordUser, user.accountData.salt)
      if (user.accountData.hash !== passwordHash) {
        return HttpStatus.NOT_FOUND
      }
      else {
        return user
      }
    }


    async deleteUserAll(): Promise<HttpStatus.NO_CONTENT | HttpStatus.NOT_FOUND> {
      return await  this.usersRepository.deleteUsers()
    }

    async findByUserId(userId: mongoose.Types.ObjectId): Promise< MeViewModel | HttpStatus.NOT_FOUND> {

      const result = await  this.usersQueryRepository.findUserById(userId)
      if (result !== HttpStatus.NOT_FOUND) {
        const resultUserViewModel : MeViewModel = {
          email: result.accountData.email,
          login: result.accountData.login,
          userId: result._id
        }
        return resultUserViewModel
      }
      return HttpStatus.NOT_FOUND
    }

    async findUserByCode(code: string): Promise<UserDocument | HttpStatus.NOT_FOUND> {
      let user = await  this.usersQueryRepository.findUserByCode(code)
      if (user === HttpStatus.BAD_REQUEST) {
        return HttpStatus.NOT_FOUND
      } else {
        return user
      }
    }

    async findUserByEmail(email: string): Promise<UserDocument | HttpStatus.NOT_FOUND> {
      let user = await  this.usersQueryRepository.findUserByEmail(email)
      if (user === HttpStatus.NOT_FOUND) {
        return HttpStatus.NOT_FOUND
      } else {
        return user
      }
    }
}