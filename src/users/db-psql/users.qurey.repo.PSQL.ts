import { QueryPaginationTypeUser } from '../../helpers/query-filter';
import { HttpCode, HttpStatus, Injectable, HttpException } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { FilterQuery, Model } from "mongoose";
import { User, UserDocument } from "../models/users-schema";
import mongoose, { ObjectId } from "mongoose";
import { emailConfirmationPSQL, userModelPSQL, userMongoModel, userViewModel } from "../models/users-model";
import { log } from "console";
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';



@Injectable()

export class UsersQueryRepoPSQL {
  constructor(@InjectDataSource() private userModel: DataSource) { }

  async findUsers(paginatorUser: QueryPaginationTypeUser) {
    const filter:  FilterQuery<userMongoModel> = {};
    let query = `SELECT * FROM public."users"
                  ORDER BY "${paginatorUser.sortBy}" ${paginatorUser.sortDirection}
                  `
      if (paginatorUser.searchLoginTerm !== '' && paginatorUser.searchEmailTerm !== '') {
        
        query = `SELECT * FROM public."users"  
                WHERE "login" ILIKE '%${paginatorUser.searchLoginTerm}%' OR "email" ILIKE '%${paginatorUser.searchEmailTerm}%'
                ORDER BY "${paginatorUser.sortBy}" ${paginatorUser.sortDirection}
                `
      }
      if (paginatorUser.searchLoginTerm !== '' && paginatorUser.searchEmailTerm === '') {
        
        query = `SELECT * FROM public."users"  
                WHERE "login" ILIKE '%${paginatorUser.searchLoginTerm}%'
                ORDER BY "${paginatorUser.sortBy}" ${paginatorUser.sortDirection}
                `
      }
      if (paginatorUser.searchLoginTerm === '' && paginatorUser.searchEmailTerm !== '') {
        
        query = `SELECT * FROM public."users"  
                WHERE "email" ILIKE '%${paginatorUser.searchEmailTerm}%'
                ORDER BY "${paginatorUser.sortBy}" ${paginatorUser.sortDirection}
                `
      }
      
    // const query = `SELECT * FROM public."users"  
    //               WHERE "login" LIKE $1 OR "email" LIKE $2
    //               ORDER BY "${paginatorUser.sortBy}" ${paginatorUser.sortDirection}
    //               LIMIT $3 OFFSET $4`
    const queryResult = `${query}`+` LIMIT $1 OFFSET $2`
    
    const users = await this.userModel.query(queryResult, 
    [paginatorUser.pageSize, paginatorUser.skip])
        // where(filter).
        // sort([[`accountData.${paginatorUser.sortBy}`, paginatorUser.sortDirection]]).
        // skip(paginatorUser.skip).
        // limit(paginatorUser.pageSize).
        // lean()
    //const totalCount = await this.userModel.countDocuments(filter)
    let totalCount = (await this.userModel.query(query)).length
    const usersOutput: userViewModel[] = users.map((b) => {
      return {
        id: b._id.toString(),
        login: b!.login,
        email: b!.email,
        createdAt: b!.createdAt,
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
      let user = await this.userModel.query(`SELECT * FROM public."users" as u WHERE u."_id" = $1`, [userId]);

      if (user.length === 0) {
        throw new HttpException ('Not found',HttpStatus.NOT_FOUND)
      }
      else {
       
          return {
            _id: user[0]._id.toString(),
            login: user[0].login,
            email: user[0].email,
            createdAt: user[0].createdAt,
            salt: user[0].salt,
            hash: user[0].hash
          }

      }
    } catch (e) { throw new HttpException ('Not found',HttpStatus.NOT_FOUND) }
  }

  async findByLoginOrEmailL(loginOrEmail: string): Promise<userModelPSQL | HttpStatus.NOT_FOUND> {
    
    const user = await this.userModel.query(
      `SELECT * FROM public."users" as u 
      WHERE u."login" = $1 or u."email" = $1`, [loginOrEmail]
      //{ $or: [{ 'accountData.email': loginOrEmail }, { 'accountData.login': loginOrEmail }] }
      )
    if (user.length === 0) {
      return HttpStatus.NOT_FOUND
    }
    
    else {
      
      //return user.map((b) => {
        return {
          
          _id: user[0]._id.toString(),
          login: user[0].login,
          email: user[0].email,
          createdAt: user[0].createdAt,
          salt: user[0].salt,
          hash: user[0].hash
        //}
      }
      
    }
  }


  async findUserByCode(code: string): Promise<emailConfirmationPSQL | null> {
    try {
      const result = await this.userModel.query(`SELECT * FROM public."emailconfirmations" as u WHERE u."confirmationCode" = $1`, [code]
        //{ "emailConfirmation.confirmationCode": code }
        )
      if(result.length === 0) {return null}
      else {
          return {
            userId: result[0].userId,
            confirmationCode:  result[0].confirmationCode,
            expiritionDate:  result[0].expiritionDate,
            isConfirmed:  result[0].isConfirmed,
            recoveryCode: result[0].recoveryCode
          }
      }
    }
    catch (e) {
       return null
       }
  }

  async findUserByEmail(email: string): Promise<userModelPSQL | null> {
    try {
      const result = await this.userModel.query(`SELECT * FROM public."users" as u WHERE u."email" = $1`, [email]
        //{ "accountData.email": email }
      )
      if(result.length === 0) {return null}
      else {
          return {
            _id: result[0]._id.toString(),
          login: result[0].login,
          email: result[0].email,
          createdAt: result[0].createdAt,
          salt: result[0].salt,
          hash: result[0].hash
          }

      }
    }
    catch (e) { return null }
  }

  async findUserByLogin(login: string): Promise<userModelPSQL | null> {
    try {
      let result = await this.userModel.query(`SELECT * FROM public."users" as u WHERE u."login" = $1`, [login]

        //{ "accountData.login": login }
        )
        if(result.length === 0) {return null}
        else {
            return {
              _id: result[0]._id.toString(),
              login: result[0].login,
              email: result[0].email,
              createdAt: result[0].createdAt,
              salt: result[0].salt,
              hash: result[0].hash
        }
      }
    }
      catch (e) { return null }
    }


  async findUserByRecoveryCode(recoveryCode: string): Promise<emailConfirmationPSQL | null> {
    try {
      let user = await this.userModel.query(`SELECT * FROM public."email_onfirmation" as u WHERE u."recoveryCode" = $1`, [recoveryCode]
        //{ "emailConfirmation.recoveryCode": recoveryCode }
      )
      if (user.length > 0) {
          return {
            userId: user[0].userId,
            confirmationCode:  user[0].confirmationCode,
            expiritionDate:  user[0].expiritionDate,
            isConfirmed:  user[0].isConfirmed,
            recoveryCode: user[0].recoveryCode
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
    let user = await this.userModel.query(`SELECT * FROM public."emailconfirmations" as u WHERE u."userId" = $1`, [userId]
      //{ "emailConfirmation.recoveryCode": recoveryCode }
    )
    if (user.length > 0) {
        return {
          userId: user[0].userId,
            confirmationCode:  user[0].confirmationCode,
            expiritionDate:  user[0].expiritionDate,
            isConfirmed:  user[0].isConfirmed,
            recoveryCode: user[0].recoveryCode
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