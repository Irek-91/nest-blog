import { QueryPaginationTypeUser } from '../../helpers/query-filter';
import { HttpCode, HttpStatus, Injectable, HttpException } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { FilterQuery, Model } from "mongoose";
import { User, UserDocument } from "../models/users-schema";
import mongoose, { ObjectId } from "mongoose";
import { userMongoModel, userViewModel } from "../models/users-model";
import { log } from "console";
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';



@Injectable()

export class UsersQueryRepoPSQL {
  constructor(@InjectDataSource() private userModel: DataSource) { }

  async findUsers(paginatorUser: QueryPaginationTypeUser) {
    const filter:  FilterQuery<userMongoModel> = {};

    if (paginatorUser.searchLoginTerm || paginatorUser.searchEmailTerm) {
      filter.$or = []
      if (paginatorUser.searchLoginTerm) {
        filter.$or.push({ 'accountData.login': { $regex: paginatorUser.searchLoginTerm, $options: 'i' } })
      }
      if (paginatorUser.searchEmailTerm) {
        filter.$or.push({ 'accountData.email': { $regex: paginatorUser.searchEmailTerm, $options: 'i' } })
      }
    }
    const sortByWithCollate = paginatorUser.sortBy !== 'createdAt' ? 'COLLATE "C"' : '';

    const query = `SELECT * FROM public."Users" as u WHERE u."login" LIKE $1 or u."email" LIKE $2
                  ORDER BY "${paginatorUser.sortBy}" ${sortByWithCollate} ${paginatorUser.sortDirection}
                  LIMIT $3 OFFSET $4`
    const users = await this.userModel.query(query, 
    [`%${paginatorUser.searchLoginTerm}%`, `%${paginatorUser.searchEmailTerm}%`,
    paginatorUser.pageSize, paginatorUser.skip
    ])
        // where(filter).
        // sort([[`accountData.${paginatorUser.sortBy}`, paginatorUser.sortDirection]]).
        // skip(paginatorUser.skip).
        // limit(paginatorUser.pageSize).
        // lean()
    //const totalCount = await this.userModel.countDocuments(filter)
    let totalCount = users.length
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


  async findUserById(userId: string): Promise<UserDocument> {
    try {
      let user = await this.userModel.query(`SELECT * FROM public."Users" as u WHERE u."_id" = $1`, [userId]);

      if (user.length === 0) {
        throw new HttpException ('Not found',HttpStatus.NOT_FOUND)
      }
      else {
        return user
      }
    } catch (e) { throw new HttpException ('Not found',HttpStatus.NOT_FOUND) }
  }

  async findByLoginOrEmailL(loginOrEmail: string): Promise<UserDocument | HttpStatus.NOT_FOUND> {
    const user = await this.userModel.query(
      `SELECT * FROM public."Users" as u WHERE u."login" = $1 or u."email" = $1`, [loginOrEmail]
      //{ $or: [{ 'accountData.email': loginOrEmail }, { 'accountData.login': loginOrEmail }] }
      )
    if (user.length === 0) {
      return HttpStatus.NOT_FOUND
    }
    else {
      return user
    }
  }


  async findUserByCode(code: string): Promise<UserDocument | null> {
    try {
      return this.userModel.query(`SELECT * FROM public."EmailConfirmation" as u WHERE u."confirmationCode" = $1`, [code]
        //{ "emailConfirmation.confirmationCode": code }
        )
    }
    catch (e) {
       return null
       }
  }

  async findUserByEmail(email: string): Promise<UserDocument | null> {
    try {
      const result = await this.userModel.query(`SELECT * FROM public."Users" as u WHERE u."email" = $1`, [email]
        //{ "accountData.email": email }
      )
      if(result.length === 0) {return null}
      else {return result}
    }
    catch (e) { return null }
  }

  async findUserByLogin(login: string): Promise<UserDocument | null> {
    try {
      let result = await this.userModel.query(`SELECT * FROM public."Users" as u WHERE u."login" = $1`, [login]

        //{ "accountData.login": login }
        )
        if(result.length === 0) {return null}
        else {return result}
      }
      catch (e) { return null }
    }


  async findUserByRecoveryCode(recoveryCode: string): Promise<UserDocument | null> {
    try {
      let user = await this.userModel.query(`SELECT * FROM public."EmailConfirmation" as u WHERE u."login" = $1`, [recoveryCode]
        //{ "emailConfirmation.recoveryCode": recoveryCode }
      )
      if (user.length > 0) {
        return user
      } else {
        return null
      }
    }
    catch (e) {
      return null
    }
}
}