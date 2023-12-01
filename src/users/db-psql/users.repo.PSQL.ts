import { HttpCode, HttpStatus, Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import mongoose, { FilterQuery, Model } from "mongoose";
import { User, UserDocument } from "../models/users-schema";
import { userMongoModel, userViewModel } from "../models/users-model";
import { log } from "console";
import { InjectDataSource } from "@nestjs/typeorm";
import { DataSource } from "typeorm";



@Injectable()

export class UsersRepositoryPSQL {
  constructor(@InjectDataSource() private userModel: DataSource) { }

  async createUser(newUser: User) {
    //const userInstance = newUser
    //await userInstance.save()
    const query = `INSERT INTO public."Users"(
              login, email, salt, hash, "createdAt", _id)
              VALUES ('${newUser.accountData.login}' , '${newUser.accountData.email}',
                      '${newUser.accountData.salt}' , '${newUser.accountData.hash}',
                      '${newUser.accountData.createdAt}','${newUser._id}');

              INSERT INTO public."EmailConfirmation"(
              "confirmationCode", "expiritionDate", "isConfirmed", "recoveryCode", "userId")
              VALUES ('${newUser.emailConfirmation.confirmationCode}' , '${newUser.emailConfirmation.expiritionDate}',
                        '${newUser.emailConfirmation.isConfirmed}' , '${newUser.emailConfirmation.recoveryCode}',
                        '${newUser._id}')
              `
    const user = await this.userModel.query(query)
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
      let user = await this.userModel.query(`
        DELETE FROM public."Users" as u WHERE u."_id" = $1  
      `, [userId])
      let userEmail = await this.userModel.query(`
        DELETE FROM public."EmailConfirmation" as e WHERE e."userId" = $1  
      `, [userId])
      if (user[1] > 0 ) {
        return HttpStatus.NO_CONTENT
      } else {return HttpStatus.NOT_FOUND}
    }
    catch (e) { return HttpStatus.NOT_FOUND }
  }

  async deleteUsers(): Promise<HttpStatus.NO_CONTENT | HttpStatus.NOT_FOUND> {
    try {
      //let user = await this.userModel.deleteMany()
      
      let user = await this.userModel.query(`
        DELETE FROM public."Users"
      `)

      let emailUsers = await this.userModel.query(`
        DELETE FROM public."EmailConfirmation"
      `)

      if (user[1] > 0) {
        return HttpStatus.NO_CONTENT
      } else {return HttpStatus.NOT_FOUND}
    }
    catch (e) { return HttpStatus.NOT_FOUND }
  }

  async updateConfirmation(_id: string): Promise<boolean> {
    let result = await this.userModel.query(`
    UPDATE public."EmailConfirmation"
	  SET "isConfirmed"= true, "confirmationCode" = null, "expiritionDate" = null
	  WHERE "userId" = $1;
    `, [_id])
    // let result = await this.userModel.updateOne({ _id }, { $set: { 
    //     "emailConfirmation.isConfirmed": true,
    //     "emailConfirmation.confirmationCode": null,
    //     "emailConfirmation.expiritionDate": null,
    // } })

    return true
  }

  async updateCode(_id: string, code: string, expiritionDate: Date): Promise<boolean> {
    let result = await this.userModel.query(`
    UPDATE public."EmailConfirmation" 
    SET "confirmationCode" = $1,"expiritionDate" = $2
    WHERE "userId" = $3;
    `, [code, expiritionDate, _id])

   // let result = await this.userModel.updateOne({ _id }, { $set: { "emailConfirmation.confirmationCode": code, "emailConfirmation.expiritionDate": expiritionDate } })
    //return result.matchedCount === 1
    return true
  }

  async updatePassword(_id: string, salt: string, hash: string): Promise<boolean> {
    let result = await this.userModel.query(`
    UPDATE public."Users" as u
    SET "salt" = $1, "hash" =$2
    WHERE "userId" = $3
    `, [salt, hash, _id])
    return true
    //let result = await this.userModel.updateOne({ _id }, { $set: { "accountData.salt": salt, "accountData.hash": hash } })
    //return result.modifiedCount === 1
  }

  async updateRecoveryCode(_id: string, recoveryCode: string): Promise<boolean> {
    let result = await this.userModel.query(`
    UPDATE public."EmailConfirmation"
    SET "recoveryCode" = $1
    WHERE "userId" = $2
    `, [recoveryCode, _id])
    return true
    //let result = await this.userModel.updateOne({ _id }, { $set: { "emailConfirmation.recoveryCode": recoveryCode } })
    //return result.modifiedCount === 1
  }

}