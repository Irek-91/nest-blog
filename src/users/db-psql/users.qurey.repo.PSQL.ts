import { BannedUser } from './entity/banned.user.entity';
import { banStatusEnum, queryPaginationTypeUserSA } from './../../helpers/query-filter-users-SA';
import { User } from './entity/user.entity';
import { EmailConfirmation } from './entity/email.confirm.entity';
import { HttpCode, HttpStatus, Injectable, HttpException } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { FilterQuery, Model } from "mongoose";
import { UserDocument } from "../models/users-schema";
import mongoose, { ObjectId } from "mongoose";
import { emailConfirmationPSQL, userModelPSQL, userMongoModel, userViewModel, usersViewModel } from "../models/users-model";
import { log } from "console";
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource, ILike, In, IsNull, Not } from 'typeorm';
import { IsBoolean } from 'class-validator';



@Injectable()

export class UsersQueryRepoPSQL {
  constructor(@InjectDataSource() private userModel: DataSource) { }

  async findUsers(paginatorUser: queryPaginationTypeUserSA): Promise<usersViewModel> {
    let usersOutput: userViewModel[] = []
    try {
      const filter: FilterQuery<userMongoModel> = {};
      let statusUserFilte= { status: In([false, true]) }
      if (paginatorUser.banStatus === banStatusEnum.banned) {
        statusUserFilte = { status: In([true]) }
      }
      if (paginatorUser.banStatus === banStatusEnum.notBanned) {
        statusUserFilte = { status: In([false]) }
      }

      let users: any = []
      let queryLogin = {}
      let queryEmail = {}


      if (paginatorUser.searchLoginTerm !== null && paginatorUser.searchEmailTerm !== null) {

        queryLogin = { login: ILike(`%${paginatorUser.searchLoginTerm}%`) }
        queryEmail = { email: ILike(`%${paginatorUser.searchEmailTerm}%`) }
      }
      if (paginatorUser.searchLoginTerm !== null && paginatorUser.searchEmailTerm === null) {
        queryLogin = { login: ILike(`%${paginatorUser.searchLoginTerm}%`) }

      }
      if (paginatorUser.searchLoginTerm === null && paginatorUser.searchEmailTerm !== null) {
        queryEmail = { email: ILike(`%${paginatorUser.searchEmailTerm}%`) }
      }
      users = await this.userModel
        .createQueryBuilder(User, 'u')
        .leftJoinAndSelect(BannedUser, "b", "b.userId = u._id")
        .where(queryLogin)
        .orWhere(queryEmail)
        .andWhere(statusUserFilte)
        .orderBy(`u.${paginatorUser.sortBy}`, paginatorUser.sortDirection)
        .offset(paginatorUser.skip)
        .limit(paginatorUser.pageSize)
        .getRawMany()

      let totalCount = await this.userModel.getRepository(User)
        .createQueryBuilder()
        .where(queryLogin)
        .orWhere(queryEmail)
        //.orWhere(statusUserFilte)
        .getCount()

      usersOutput = users.map((b) => {
        return {
          id: b.u__id.toString(),
          login: b.u_login,
          email: b.u_email,
          createdAt: b.u_createdAt,
          banInfo: {
            isBanned: b.u_status,
            banDate: b.b_banDate,
            banReason: b.b_banReason
          }
        }
      })
      return {
        pagesCount: Math.ceil(totalCount / paginatorUser.pageSize),
        page: paginatorUser.pageNumber,
        pageSize: paginatorUser.pageSize,
        totalCount: totalCount,
        items: usersOutput
      }
    } catch (e) {
      return {
        pagesCount: 0,
        page: paginatorUser.pageNumber,
        pageSize: paginatorUser.pageSize,
        totalCount: 0,
        items: usersOutput
      }
    }
  }

  async findUserById(userId: string): Promise<userModelPSQL | null> {
    try {
      let user = await this.userModel.getRepository(User)
        .createQueryBuilder('u')
        .where('u._id = :id', { id: userId })
        .getOne()

      //query(`SELECT * FROM public."users" as u WHERE u."_id" = $1`, [userId]);

      if (!user) {
        return null
      }
      else {

        return {
          _id: user._id,
          login: user.login,
          email: user.email,
          createdAt: user.createdAt,
          salt: user.salt,
          hash: user.hash
        }

      }
    } catch (e) {
      return null
    }
  }

  async getUserById(userId: string): Promise<User | null> {
    try {
      let user = await this.userModel.getRepository(User)
        .createQueryBuilder('u')
        .where('u._id = :id', { id: userId })
        .getOne()

      //query(`SELECT * FROM public."users" as u WHERE u."_id" = $1`, [userId]);

      if (!user) {
        return null
      }
      else {
        return user
      }
    } catch (e) {
      return null
    }
  }

  async findByLoginOrEmailL(loginOrEmail: string): Promise<User | null> {
    try {
      const user = await this.userModel.getRepository(User).createQueryBuilder('u')
        .select()
        .where('u.login = :login', { login: loginOrEmail })
        .orWhere('u.email = :email', { email: loginOrEmail })
        .getOne()

      if (!user) {
        return null
      }

      else {
        return user

      }
    } catch (e) {
      return null
    }
  }


  async findUserByCode(code: string): Promise<emailConfirmationPSQL | null> {
    try {
      const result = await this.userModel.getRepository(EmailConfirmation).createQueryBuilder('e')
        .select()
        .where('e.confirmationCode = :confirmationCode', { confirmationCode: code })
        .getOne()

      if (!result) { return null }
      else {
        return {
          userId: result.userId._id,
          confirmationCode: result.confirmationCode,
          expiritionDate: result.expiritionDate,
          isConfirmed: result.isConfirmed,
          recoveryCode: result.recoveryCode
        }
      }
    }
    catch (e) {
      return null
    }
  }

  async findUserByEmail(email: string): Promise<userModelPSQL | null> {
    try {
      const result = await this.userModel.getRepository(User).createQueryBuilder('u')
        //.select()
        .where("u.email= :email", { email: email })
        .getOne()

      if (!result) { return null }
      else {
        return {
          _id: result._id.toString(),
          login: result.login,
          email: result.email,
          createdAt: result.createdAt,
          salt: result.salt,
          hash: result.hash
        }

      }
    }
    catch (e) { return null }
  }

  async findUserByLogin(login: string): Promise<userModelPSQL | null> {
    try {

      let result = await this.userModel.getRepository(User).createQueryBuilder('u')
        //.select()
        .where('u.login = :login', { login: login })
        .getOne()

      if (!result) { return null }
      else {
        return {
          _id: result._id.toString(),
          login: result.login,
          email: result.email,
          createdAt: result.createdAt,
          salt: result.salt,
          hash: result.hash
        }
      }
    }
    catch (e) { return null }
  }


  async findUserByRecoveryCode(recoveryCode: string): Promise<emailConfirmationPSQL | null> {
    try {
      let user = await this.userModel.getRepository(EmailConfirmation).createQueryBuilder('e')
        .select()
        .where('e.recoveryCode = :recoveryCode', { recoveryCode: recoveryCode })
        .getOne()

      if (user) {
        return {
          userId: user.userId._id,
          confirmationCode: user.confirmationCode,
          expiritionDate: user.expiritionDate,
          isConfirmed: user.isConfirmed,
          recoveryCode: user.recoveryCode
        }
      } else {
        return null
      }
    }
    catch (e) {
      return null
    }
  }


  async findUserByEmailConfirmation(userId: string): Promise<emailConfirmationPSQL | null> {
    try {
      let user = await this.userModel.getRepository(EmailConfirmation).createQueryBuilder('e')
        .select()
        .where('e.userId = :userId', { userId: userId })
        .getOne()

      if (user) {
        return {
          userId: user.userId._id,
          confirmationCode: user.confirmationCode,
          expiritionDate: user.expiritionDate,
          isConfirmed: user.isConfirmed,
          recoveryCode: user.recoveryCode
        }
      } else {
        return null
      }
    }
    catch (e) {
      return null
    }
  }
}