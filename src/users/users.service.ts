import { Injectable } from "@nestjs/common";
import { UsersRepository } from "./users.repository";
import { add } from 'date-fns';
import { v4 as uuidv4 } from 'uuid';


import bcrypt from 'bcrypt'
import { CreatUserInputModel } from './models/users-model';
import { QueryPaginationTypeUser } from 'src/helpers/query-filter';
import mongoose from "mongoose";

@Injectable()
export class UserService {
  constructor(protected usersRepository: UsersRepository) { }

  async findUsers(paginationQuery: QueryPaginationTypeUser) {
    return await this.usersRepository.findUsers(paginationQuery)
  }

  async createUser(inputModel: CreatUserInputModel) {
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

  async deleteUserId(id: string): Promise<Number> {
    return await this.usersRepository.deleteUserId(id)
  }

async deleteUsers(): Promise<Number> {
    return await this.usersRepository.deleteUsers()
  }

  async _generateHash(password: string, salt: string) {
    const hash = await bcrypt.hash(password, salt)
    return hash;
  }

  //   async checkCredentials(loginOrEmail: string, passwordUser: string): Promise<userMongoModel | false> {
  //     const user = await  this.usersRepository.findByLoginOrEmailL(loginOrEmail)
  //     if (!user) {
  //       return false
  //     }
  //     const passwordHash = await this._generateHash(passwordUser, user.accountData.salt)
  //     if (user.accountData.hash !== passwordHash) {
  //       return false
  //     }
  //     else {
  //       return user
  //     }
  //   }


  //   async deleteUserAll(): Promise<boolean> {
  //     return await  this.usersRepository.deleteUserAll()
  //   }

  //   async findByUserId(userId: ObjectId): Promise<userMeViewModel | false> {

  //     const result = await  this.usersRepository.findUserById(userId)
  //     if (result) {
  //       const resultUserViewModel = {
  //         email: result.accountData.email,
  //         login: result.accountData.login,
  //         userId: result._id
  //       }
  //       return resultUserViewModel
  //     }
  //     return false
  //   }

  //   async findUserByCode(code: string): Promise<userMongoModel | null> {
  //     let user = await  this.usersRepository.findUserByCode(code)
  //     return user
  //   }

  //   async findUserByEmail(email: string): Promise<userMongoModel | null> {
  //     let user = await  this.usersRepository.findUserByEmail(email)
  //     return user
  //   }
}