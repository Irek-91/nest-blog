import { User } from './entity/user.entity';
import { EmailConfirmation } from './entity/email.confirm.entity';
import { queryPaginationTypeUser } from '../../helpers/query-filter';
import { HttpCode, HttpStatus, Injectable, HttpException } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { FilterQuery, Model } from "mongoose";
import { UserDocument } from "../models/users-schema";
import mongoose, { ObjectId } from "mongoose";
import { emailConfirmationPSQL, userModelPSQL, userMongoModel, userViewModel } from "../models/users-model";
import { log } from "console";
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource, ILike } from 'typeorm';



@Injectable()

export class UsersQueryRepoPSQL {
  constructor(@InjectDataSource() private userModel: DataSource) { }

  async findUsers(paginatorUser: queryPaginationTypeUser) {
    const filter:  FilterQuery<userMongoModel> = {};
    
    let users: User[] = []
    let gueryLogin = {}
    let gueryEmail = {}

    // `SELECT * FROM public."users"
    //               ORDER BY "${paginatorUser.sortBy}" ${paginatorUser.sortDirection}
    // `
      if (paginatorUser.searchLoginTerm !== null && paginatorUser.searchEmailTerm !== null) {
        gueryLogin = {login: ILike (`%${paginatorUser.searchLoginTerm}%`)}
        gueryEmail = {email: ILike (`%${paginatorUser.searchEmailTerm}%`)}
        // `SELECT * FROM public."users"  
        //         WHERE "login" ILIKE '%${paginatorUser.searchLoginTerm}%' OR "email" ILIKE '%${paginatorUser.searchEmailTerm}%'
        //         ORDER BY "${paginatorUser.sortBy}" ${paginatorUser.sortDirection}
        //         `
      }
      if (paginatorUser.searchLoginTerm !== '' && paginatorUser.searchEmailTerm === '') {
        gueryLogin = {login: ILike (`%${paginatorUser.searchLoginTerm}%`)}
        // `SELECT * FROM public."users"  
        //         WHERE "login" ILIKE '%${paginatorUser.searchLoginTerm}%'
        //         ORDER BY "${paginatorUser.sortBy}" ${paginatorUser.sortDirection}
        //         `
      }
      if (paginatorUser.searchLoginTerm === '' && paginatorUser.searchEmailTerm !== '') {
        gueryEmail = {email: ILike (`%${paginatorUser.searchEmailTerm}%`)}
        // `SELECT * FROM public."users"  
        //         WHERE "email" ILIKE '%${paginatorUser.searchEmailTerm}%'
        //         ORDER BY "${paginatorUser.sortBy}" ${paginatorUser.sortDirection}
        //         `
      }
      
    // const query = `SELECT * FROM public."users"  
    //               WHERE "login" LIKE $1 OR "email" LIKE $2
    //               ORDER BY "${paginatorUser.sortBy}" ${paginatorUser.sortDirection}
    //               LIMIT $3 OFFSET $4`
      users = await this.userModel.getRepository(User)
              .createQueryBuilder('u')
              .where(gueryLogin)
              .orWhere(gueryEmail)
              .orderBy(`u.${paginatorUser.sortBy}`, paginatorUser.sortDirection)
              .skip(paginatorUser.skip)
              .take(paginatorUser.pageSize)
              .getMany()
    
    
    // query(queryResult, 
    // [paginatorUser.pageSize, paginatorUser.skip])
        // where(filter).
        // sort([[`accountData.${paginatorUser.sortBy}`, paginatorUser.sortDirection]]).
        // skip(paginatorUser.skip).
        // limit(paginatorUser.pageSize).
        // lean()
    //const totalCount = await this.userModel.countDocuments(filter)
    let totalCount = await this.userModel.getRepository(User)
                                          .createQueryBuilder('u')
                                          .where(gueryLogin)
                                          .orWhere(gueryEmail)
                                          .getCount()
    //(await this.userModel.query(query)).length
    const usersOutput: userViewModel[] = users.map((b) => {
      return {
        id: b._id.toString(),
        login: b.login,
        email: b.email,
        createdAt: b.createdAt,
      }
    })
    return {
      pagesCount: Math.ceil(totalCount / paginatorUser.pageSize),
      page: paginatorUser.pageNumber,
      pageSize: paginatorUser.pageSize,
      totalCount: totalCount,
      items: usersOutput
    }
  }


  async findUserById(userId: string): Promise<userModelPSQL> {
    try {
      let user = await this.userModel.getRepository(User)
                                      .createQueryBuilder('u')
                                      .where('u._id = :id', {id:userId})
                                      .getOne()

      //query(`SELECT * FROM public."users" as u WHERE u."_id" = $1`, [userId]);

      if (!user) {
        throw new HttpException ('Not found',HttpStatus.NOT_FOUND)
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
    } catch (e) { throw new HttpException ('Not found',HttpStatus.NOT_FOUND) }
  }

  async findByLoginOrEmailL(loginOrEmail: string): Promise<userModelPSQL | HttpStatus.NOT_FOUND> {
    
    const user = await this.userModel.getRepository(User).createQueryBuilder('u')
                                      .select()
                                      .where('u.login = :login', {login: loginOrEmail})
                                      .orWhere('u.email = :email', {email: loginOrEmail})
                                      .getOne()
    // query(
    //   `SELECT * FROM public."users" as u 
    //   WHERE u."login" = $1 or u."email" = $1`, [loginOrEmail]
    //   //{ $or: [{ 'accountData.email': loginOrEmail }, { 'accountData.login': loginOrEmail }] }
    //   )
    if (!user) {
      return HttpStatus.NOT_FOUND
    }
    
    else {
      
      //return user.map((b) => {
        return {
          
          _id: user._id.toString(),
          login: user.login,
          email: user.email,
          createdAt: user.createdAt,
          salt: user.salt,
          hash: user.hash
        //}
      }
      
    }
  }


  async findUserByCode(code: string): Promise<emailConfirmationPSQL | null> {
    try {
      const result = await this.userModel.getRepository(EmailConfirmation).createQueryBuilder('e')
                                          .select()
                                          .where('e.confirmationCode = :confirmationCode', {confirmationCode :code})
                                          .getOne()
      // query(`SELECT * FROM public."emailconfirmations" as u WHERE u."confirmationCode" = $1`, [code]
      //   //{ "emailConfirmation.confirmationCode": code }
      //   )
      if(!result) {return null}
      else {
          return {
            userId: result.userId._id,
            confirmationCode:  result.confirmationCode,
            expiritionDate:  result.expiritionDate,
            isConfirmed:  result.isConfirmed,
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
                                          .where("u.email= :email", {email: email})
                                          .getOne()
      // query(`SELECT * FROM public."users" as u WHERE u."email" = $1`, [email]
      //   //{ "accountData.email": email }
      // )
      if(!result) {return null}
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
                                      .where('u.login = :login', {login: login})
                                      .getOne()
      // query(`SELECT * FROM public."users" as u WHERE u."login" = $1`, [login]

      //   //{ "accountData.login": login }
      //   )
        if(!result) {return null}
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
                                      .where('e.recoveryCode = :recoveryCode', {recoveryCode: recoveryCode})
                                      .getOne()
      //query(`SELECT * FROM public."email_onfirmation" as u WHERE u."recoveryCode" = $1`, [recoveryCode]
        //{ "emailConfirmation.recoveryCode": recoveryCode })
      
      if (user) {
          return {
            userId: user.userId._id,
            confirmationCode:  user.confirmationCode,
            expiritionDate:  user.expiritionDate,
            isConfirmed:  user.isConfirmed,
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
                                   .where('e.userId = :userId', {userId: userId})
                                   .getOne()
    //query(`SELECT * FROM public."emailconfirmations" as u WHERE u."userId" = $1`, [userId]
      //{ "emailConfirmation.recoveryCode": recoveryCode }
    
    if (user) {
        return {
            userId: user.userId._id,
            confirmationCode:  user.confirmationCode,
            expiritionDate:  user.expiritionDate,
            isConfirmed:  user.isConfirmed,
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