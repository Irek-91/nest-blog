import { CreatUserInputModel, MeViewModel, emailConfirmationPSQL, userModelPSQL } from './models/users-model';
import { queryPaginationTypeUser } from './../helpers/query-filter';
import { HttpStatus, Injectable } from "@nestjs/common";
import { UsersRepository } from "./db-mongo/users.repo";
import { add } from 'date-fns';
import { v4 as uuidv4 } from 'uuid';
import mongoose, { ObjectId } from "mongoose";
import bcrypt from 'bcrypt'
import { UserDocument } from "./models/users-schema";
import { log } from 'console';
import { UsersRepositoryPSQL } from './db-psql/users.repo.PSQL';
import { UsersQueryRepoPSQL } from './db-psql/users.qurey.repo.PSQL';

@Injectable()
export class UsersService {
  constructor(protected usersRepository: UsersRepositoryPSQL,
    protected usersQueryRepository: UsersQueryRepoPSQL) { }

  async findUsers(paginationQuery: queryPaginationTypeUser) {
    return await this.usersQueryRepository.findUsers(paginationQuery)
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
      _id: uuidv4(),
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

  async checkCredentials(loginOrEmail: string, passwordUser: string): Promise<userModelPSQL | HttpStatus.NOT_FOUND> {
    const user = await this.usersQueryRepository.findByLoginOrEmailL(loginOrEmail)
    if (user === HttpStatus.NOT_FOUND) {
      return HttpStatus.NOT_FOUND
    }
    
    const passwordHash = await this._generateHash(passwordUser, user!.salt)
    
    if (user.hash !== passwordHash) {
      return HttpStatus.NOT_FOUND
    }
    else {
      return user
    }
  }


  async deleteUserAll(): Promise<HttpStatus.NO_CONTENT | HttpStatus.NOT_FOUND> {
    return await this.usersRepository.deleteUsers()
  }

  async findByUserId(userId: string): Promise<MeViewModel> {

    const result = await this.usersQueryRepository.findUserById(userId)
    const resultUserViewModel: MeViewModel = {
      email: result.email,
      login: result.login,
      userId: result._id
    }
    return resultUserViewModel
  }

  async findUserByCode(code: string): Promise<emailConfirmationPSQL | null> {
    let user = await this.usersQueryRepository.findUserByCode(code)
    if (!user) return null
    return user
  }

  async findUserByEmail(email: string): Promise<userModelPSQL | null> {
    let user = await this.usersQueryRepository.findUserByEmail(email)
    if (!user) return null
    return user
  }


  async findUserByLogin(login: string): Promise<userModelPSQL | null> {
    let user = await this.usersQueryRepository.findUserByLogin(login)
    if (!user) return null
    return user
  }
}