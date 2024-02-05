import { Like } from './../../likes/entity/likes.entity';
import { Device } from './../../securityDevices/db-psql/entity/devices.entity';
import { User } from './entity/user.entity';
import { HttpCode, HttpStatus, Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import mongoose, { FilterQuery, Model } from "mongoose";
import { UserDocument } from "../models/users-schema";
import { userMongoModel, userViewModel } from "../models/users-model";
import { log } from "console";
import { InjectDataSource } from "@nestjs/typeorm";
import { DataSource } from "typeorm";
import { EmailConfirmation } from "./entity/email.confirm.entity";
import { BannedUser } from './entity/banned.user.entity';



@Injectable()

export class UsersRepositoryPSQL {
  constructor(@InjectDataSource() private dataSource: DataSource) { }

  async createUser(newUser: userMongoModel) {
    let userId = newUser._id.toString()

    const createUser = await this.dataSource.createQueryBuilder()
      .insert()
      .into(User)
      .values({
        login: newUser.accountData.login,
        email: newUser.accountData.email,
        salt: newUser.accountData.salt,
        hash: newUser.accountData.hash,
        createdAt: newUser.accountData.createdAt,
        _id: newUser._id.toString(),
        status: false
      })
      .execute()
    const createUserBanTable = await this.dataSource.createQueryBuilder()
      .insert()
      .into(BannedUser)
      .values({
        userId: { _id: newUser._id }
      })
      .execute()

    const createEmailByUser = await this.dataSource.createQueryBuilder()
      .insert()
      .into(EmailConfirmation)
      .values({
        confirmationCode: newUser.emailConfirmation.confirmationCode,
        expiritionDate: newUser.emailConfirmation.expiritionDate,
        isConfirmed: newUser.emailConfirmation.isConfirmed,
        recoveryCode: newUser.emailConfirmation.recoveryCode,
        userId: { _id: newUser._id }
      })
      .execute()
    const user: userViewModel = {
      id: newUser._id.toString(),
      login: newUser.accountData!.login,
      email: newUser.accountData!.email,
      createdAt: newUser.accountData!.createdAt,
      banInfo: {
        isBanned: false,
        banDate: null,
        banReason: null
      }
    }
    return user
  }


  async deleteUserId(userId: string): Promise<true | null> {
    try {
      const deletedUserEmail = await this.dataSource.createQueryBuilder()
        .delete()
        .from(EmailConfirmation)
        .where({ userId: userId })
        .execute()
      const deletedUserBan = await this.dataSource.createQueryBuilder()
        .delete()
        .from(BannedUser)
        .where({ userId: userId })
        .execute()

      const deletedUserDevice = await this.dataSource.createQueryBuilder()
        .delete()
        .from(Device)
        .where({ userId: userId })
        .execute()
      const deletedUserLikes = await this.dataSource.createQueryBuilder()
        .delete()
        .from(Like)
        .where({ userId: userId })
        .execute()
      const deletedUser = await this.dataSource.createQueryBuilder()
        .delete()
        .from(User)
        .where({ _id: userId })
        .execute()
      if (deletedUserEmail.affected === 0 || deletedUser.affected === 0) {
        return null
      }
      else {
        return true
      }

    }
    catch (e) { return null }
  }

  async deleteUsers(): Promise<HttpStatus.NO_CONTENT | HttpStatus.NOT_FOUND> {
    try {

      const deletedUsersEmail = await this.dataSource.createQueryBuilder()
        .delete()
        .from(EmailConfirmation)
        .execute()
      const deletedUsersBan = await this.dataSource.createQueryBuilder()
        .delete()
        .from(BannedUser)
        .execute()

      const deletedDevices = await this.dataSource.createQueryBuilder()
        .delete()
        .from(Device)
        .execute()
      const deletedLikes = await this.dataSource.createQueryBuilder()
        .delete()
        .from(Like)
        .execute()

      const deletedUsers = await this.dataSource.createQueryBuilder()
        .delete()
        .from(User)
        .execute()


      if (deletedUsersEmail.affected === 0 || deletedUsers.affected === 0) {
        return HttpStatus.NOT_FOUND
      }
      else {
        return HttpStatus.NO_CONTENT
      }
    }
    catch (e) { return HttpStatus.NOT_FOUND }
  }

  async updateConfirmation(_id: string): Promise<true | null> {
    let resultUpdateConfirmation = await this.dataSource.createQueryBuilder()
      .update(EmailConfirmation)
      .set({ confirmationCode: null, expiritionDate: null, isConfirmed: true })
      .where({ userId: _id })
      .execute()
    if (!resultUpdateConfirmation) {
      return null
    } else {
      return true
    }


    return true
  }

  async updateCode(_id: string, code: string, expiritionDate: Date): Promise<true | null> {
    let resultUpdateCode = await this.dataSource.createQueryBuilder()
      .update(EmailConfirmation)
      .set({ confirmationCode: code, expiritionDate: expiritionDate })
      .where({ userId: _id })
      .execute()
    if (!resultUpdateCode) {
      return null
    } else {
      return true
    }

  }

  async updatePassword(_id: string, salt: string, hash: string): Promise<true | null> {
    let resultUpdatePassword = await this.dataSource.createQueryBuilder()
      .update(User)
      .set({ salt: salt, hash: hash })
      .where({ _id: _id })
      .execute()
    if (!resultUpdatePassword) {
      return null
    } else { return true }

  }

  async updateRecoveryCode(_id: string, recoveryCode: string): Promise<true | null> {
    let resultUpdateCode = await this.dataSource.createQueryBuilder()
      .update(EmailConfirmation)
      .set({ recoveryCode: recoveryCode })
      .where({ userId: _id })
      .execute()
    if (!resultUpdateCode) {
      return null
    } else {
      return true
    }

  }


  async updateStatusUser(userId: string, isBanned: boolean, 
    banReason: string | null, banDate: string | null): Promise<User | null> {

    let resultUpdateUser = await this.dataSource.createQueryBuilder()
      .update(User)
      .set({ status: isBanned })
      .where({ _id: userId })
      .execute()
    let user = await this.dataSource.getRepository(User)
      .createQueryBuilder('u')
      .where('u._id = :id', { id: userId })
      .getOne()


    let resultUpdateReason = await this.dataSource.createQueryBuilder()
      .update(BannedUser)
      .set({
        banReason: banReason,
        banDate: banDate
      })
      .where({ userId: userId })
      .execute()


    if (!resultUpdateUser) {
      return null
    } else {
      return user
    }

  }

}