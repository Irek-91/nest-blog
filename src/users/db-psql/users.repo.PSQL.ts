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



@Injectable()

export class UsersRepositoryPSQL {
  constructor(@InjectDataSource() private userModel: DataSource) { }

  async createUser(newUser: userMongoModel) {
    let userId = newUser._id.toString()
    //const userInstance = newUser
    //await userInstance.save()
    // const query = `INSERT INTO public."users"(
    //           login, email, salt, hash, "createdAt", _id)
    //           VALUES ('${newUser.accountData.login}' , '${newUser.accountData.email}',
    //                   '${newUser.accountData.salt}' , '${newUser.accountData.hash}',
    //                   '${newUser.accountData.createdAt}','${newUser._id}');

    //           INSERT INTO public."emailconfirmations"(
    //           "confirmationCode", "expiritionDate", "isConfirmed", "recoveryCode", "userId")
    //           VALUES ('${newUser.emailConfirmation.confirmationCode}' , '${newUser.emailConfirmation.expiritionDate}',
    //                     '${newUser.emailConfirmation.isConfirmed}' , '${newUser.emailConfirmation.recoveryCode}',
    //                     '${newUser._id}')
    //           `
    // const user = await this.userModel.query(query)
    const createUser = await this.userModel.createQueryBuilder()
                                            .insert()
                                            .into(User)
                                            .values({
                                              login: newUser.accountData.login,
                                              email: newUser.accountData.email,
                                              salt: newUser.accountData.salt,
                                              hash: newUser.accountData.hash,
                                              createdAt: newUser.accountData.createdAt,
                                              _id: newUser._id.toString()
                                            })
                                            .execute()

    const createEmailByUser = await this.userModel.createQueryBuilder()
                                            .insert()
                                            .into(EmailConfirmation)
                                            .values({
                                              confirmationCode: newUser.emailConfirmation.confirmationCode,
                                              expiritionDate: newUser.emailConfirmation.expiritionDate,
                                              isConfirmed: newUser.emailConfirmation.isConfirmed,
                                              recoveryCode: newUser.emailConfirmation.recoveryCode,
                                              userId: newUser._id.toString()
                                            })
                                            .execute()



    
    
    const userViewVodel = {
      id: newUser._id.toString(),
      login: newUser.accountData!.login,
      email: newUser.accountData!.email,
      createdAt: newUser.accountData!.createdAt
    }
    return userViewVodel
  }


  async deleteUserId(userId: string): Promise<HttpStatus.NO_CONTENT | HttpStatus.NOT_FOUND> {
    try {
      //let user = await this.userModel.deleteOne({ _id: new mongoose.Types.ObjectId(userId) })
      const deletedUserEmail = await this.userModel.createQueryBuilder()
                                                  .delete()
                                                  .from(EmailConfirmation)
                                                  .where({userId: userId})
                                                  .execute()
      const deletedUser = await this.userModel.createQueryBuilder()
                                                  .delete()
                                                  .from(User)
                                                  .where({_id: userId})
                                                  .execute()
      if (!deletedUserEmail || !deletedUser) {
        return HttpStatus.NOT_FOUND
      }
      else {
        return HttpStatus.NO_CONTENT
      }
      // let userEmail = await this.userModel.query(`
      //   DELETE FROM public."emailconfirmations" as e WHERE e."userId" = $1  
      // `, [userId])

      // let user = await this.userModel.query(`
      //   DELETE FROM public."users" as u WHERE u."_id" = $1  
      // `, [userId])


      // if (user[1] > 0) {
      //   return HttpStatus.NO_CONTENT
      // } else { return HttpStatus.NOT_FOUND }
    }
    catch (e) { return HttpStatus.NOT_FOUND }
  }

  async deleteUsers(): Promise<HttpStatus.NO_CONTENT | HttpStatus.NOT_FOUND> {
    try {

      const deletedUsersEmail = await this.userModel.createQueryBuilder()
                                                  .delete()
                                                  .from(EmailConfirmation)
                                                  .execute()
      const deletedUsers = await this.userModel.createQueryBuilder()
                                                .delete()
                                                .from(User)
                                                .execute()
      if (!deletedUsersEmail || !deletedUsers) {
        return HttpStatus.NOT_FOUND
      }
      else {
        return HttpStatus.NO_CONTENT
      }
    //   //let user = await this.userModel.deleteMany()

    //   let emailUsers = await this.userModel.query(`
    //   DELETE FROM public."emailconfirmations"
    // `)

    //   let user = await this.userModel.query(`
    //     DELETE FROM public."users"
    //   `)

    //   if (user[1] > 0) {
    //     return HttpStatus.NO_CONTENT
    //   } else { return HttpStatus.NOT_FOUND }
    }
    catch (e) { return HttpStatus.NOT_FOUND }
  }

  async updateConfirmation(_id: string): Promise<true | null> {
    let resultUpdateConfirmation = await this.userModel.createQueryBuilder()
      .update(EmailConfirmation)
      .set({ confirmationCode: null, expiritionDate: null, isConfirmed: true})
      .where({ userId: _id })
      .execute()
    if (!resultUpdateConfirmation) {
      return null
    } else {
      return true
    }
    
    // let result = await this.userModel.query(`
    // UPDATE public."emailconfirmations"
	  // SET "isConfirmed"= true, "confirmationCode" = null, "expiritionDate" = null
	  // WHERE "userId" = $1;
    // `, [_id])
    // let result = await this.userModel.updateOne({ _id }, { $set: { 
    //     "emailConfirmation.isConfirmed": true,
    //     "emailConfirmation.confirmationCode": null,
    //     "emailConfirmation.expiritionDate": null,
    // } })

    return true
  }

  async updateCode(_id: string, code: string, expiritionDate: Date): Promise<true | null> {
    let resultUpdateCode = await this.userModel.createQueryBuilder()
      .update(EmailConfirmation)
      .set({ confirmationCode: code, expiritionDate: expiritionDate })
      .where({ userId: _id })
      .execute()
    if (!resultUpdateCode) {
      return null
    } else {
      return true
    }
    //   let result = await this.userModel.query(`
    //   UPDATE public."emailconfirmations" 
    //   SET "confirmationCode" = $1,"expiritionDate" = $2
    //   WHERE "userId" = $3;
    //   `, [code, expiritionDate, _id])

    //  // let result = await this.userModel.updateOne({ _id }, { $set: { "emailConfirmation.confirmationCode": code, "emailConfirmation.expiritionDate": expiritionDate } })
    //   //return result.matchedCount === 1
    //   return true
  }

  async updatePassword(_id: string, salt: string, hash: string): Promise<true | null> {
    let resultUpdatePassword = await this.userModel.createQueryBuilder()
      .update(User)
      .set({ salt: salt, hash: hash })
      .where({ _id: _id })
      .execute()
    if (!resultUpdatePassword) {
      return null
    } else { return true }


    // let result = await this.userModel.query(`
    // UPDATE public."users" as u
    // SET "salt" = $1, "hash" =$2
    // WHERE "userId" = $3
    // `, [salt, hash, _id])
    // return true
    //let result = await this.userModel.updateOne({ _id }, { $set: { "accountData.salt": salt, "accountData.hash": hash } })
    //return result.modifiedCount === 1
  }

  async updateRecoveryCode(_id: string, recoveryCode: string): Promise<true | null> {
    let resultUpdateCode = await this.userModel.createQueryBuilder()
      .update(EmailConfirmation)
      .set({ recoveryCode: recoveryCode })
      .where({ userId: _id })
      .execute()
    if (!resultUpdateCode) {
      return null
    } else {
      return true
    }
    // let result = await this.userModel.query(`
    // UPDATE public."emailconfirmations"
    // SET "recoveryCode" = $1
    // WHERE "userId" = $2
    // `, [recoveryCode, _id])
    // return true
    //let result = await this.userModel.updateOne({ _id }, { $set: { "emailConfirmation.recoveryCode": recoveryCode } })
    //return result.modifiedCount === 1
  }

}