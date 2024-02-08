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
import { Brackets, DataSource, Equal, ILike, In, IsNull, Like, Not } from 'typeorm';
import { IsBoolean } from 'class-validator';



@Injectable()

export class UsersQueryRepoPSQL {
  constructor(@InjectDataSource() private userModel: DataSource) { }

  async findUsers(paginatorUser: queryPaginationTypeUserSA): Promise<usersViewModel> {
    let usersOutput: userViewModel[] = []
    try {
      let statusFilter: null | boolean = null
      let searchLoginTerm = paginatorUser.searchLoginTerm
      let searchEmailTerm = paginatorUser.searchEmailTerm

      if (paginatorUser.banStatus === banStatusEnum.banned) {
        statusFilter = true
      }
      if (paginatorUser.banStatus === banStatusEnum.notBanned) {
        statusFilter = false
      }

      let users: any = []
      let filterLoginOrEmail = {}
      let filterEmail = {}
      let totalCount = 0

      users = await this.userModel
        .createQueryBuilder(User, 'u')
        .leftJoinAndSelect(BannedUser, "b", "b.userId = u._id")
        //.where(`${searchLoginTerm !== null ? `u.login ILIKE '%${searchLoginTerm}%'` : `u.login is not null`}`)
        //.orWhere(`${searchEmailTerm !== null ? `u.email ILIKE '%${searchEmailTerm}%'` : `u.email is not null`}`)
        .where(new Brackets(qb => {
          qb.where(`${searchLoginTerm !== null ? `u.login ILIKE '%${searchLoginTerm}%'` : `u.login is not null`}`)
            .orWhere(`${searchEmailTerm !== null ? `u.email ILIKE '%${searchEmailTerm}%'` : `u.email is not null`}`);
        })
        )
        .andWhere(`${statusFilter !== null ? `u.status = ${statusFilter}` : 'u.status is not null'}`)
        .orderBy(`u.${paginatorUser.sortBy}`, paginatorUser.sortDirection)
        .offset(paginatorUser.skip)
        .limit(paginatorUser.pageSize)
        .getRawMany()

        


      totalCount = await this.userModel
        .createQueryBuilder(User, 'u')
        .leftJoinAndSelect(BannedUser, "b", "b.userId = u._id")
        //.where(`${searchLoginTerm !== null ? `u.login ILIKE '%${searchLoginTerm}%'` : `u.login is not null`}`)
        //.orWhere(`${searchEmailTerm !== null ? `u.email ILIKE '%${searchEmailTerm}%'` : `u.email is not null`}`)
        .where(new Brackets(qb => {
          qb.where(`${searchLoginTerm !== null ? `u.login ILIKE '%${searchLoginTerm}%'` : `u.login is not null`}`)
            .orWhere(`${searchEmailTerm !== null ? `u.email ILIKE '%${searchEmailTerm}%'` : `u.email is not null`}`);
        })
        )
        .andWhere(`${statusFilter !== null ? `u.status = ${statusFilter}` : 'u.status is not null'}`)
        .orderBy(`u.${paginatorUser.sortBy}`, paginatorUser.sortDirection)
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