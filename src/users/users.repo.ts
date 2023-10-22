import { HttpCode, HttpStatus, Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { FilterQuery, Model } from "mongoose";
import { User, UserDocument } from "./models/users-schema";
import { Filter, ObjectId } from "mongodb";
import { userMongoModel, userViewModel } from "./models/users-model";
import { QueryPaginationTypeUser } from 'src/helpers/query-filter';
import { log } from "console";



@Injectable()

export class UsersRepository {
  constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) { }

  async createUser(newUser: User) {
    const userInstance = new this.userModel(newUser)

    await userInstance.save()

    const userViewVodel = {
      id: userInstance._id.toString(),
      login: userInstance.accountData!.login,
      email: userInstance.accountData!.email,
      createdAt: userInstance.accountData!.createdAt
    }
    return userViewVodel
  }

  async deleteUserId(userId: string): Promise<HttpStatus.NO_CONTENT | HttpStatus.NOT_FOUND> {
    try {
      let user = await this.userModel.deleteOne({ _id: new ObjectId(userId) })
      if (user.deletedCount) {
        return HttpStatus.NO_CONTENT
      } else {return HttpStatus.NOT_FOUND}
    }
    catch (e) { return HttpStatus.NOT_FOUND }
  }

  async deleteUsers(): Promise<HttpStatus.NO_CONTENT | HttpStatus.NOT_FOUND> {
    try {
      let user = await this.userModel.deleteMany()
      if (user.deletedCount) {
        return HttpStatus.NO_CONTENT
      } else {return HttpStatus.NOT_FOUND}
    }
    catch (e) { return HttpStatus.NOT_FOUND }
  }

  async updateConfirmation(_id: ObjectId): Promise<boolean> {
    let result = await this.userModel.updateOne({ _id }, { $set: { "emailConfirmation.isConfirmed": true } })
    return result.modifiedCount === 1
  }

  async updateCode(_id: ObjectId, code: string, expiritionDate: Date): Promise<boolean> {
    let result = await this.userModel.updateOne({ _id }, { $set: { "emailConfirmation.confirmationCode": code, "emailConfirmation.expiritionDate": expiritionDate } })
    return result.modifiedCount === 2
  }

  async updatePassword(_id: ObjectId, salt: string, hash: string): Promise<boolean> {
    let result = await this.userModel.updateOne({ _id }, { $set: { "accountData.salt": salt, "accountData.hash": hash } })
    return result.modifiedCount === 1
  }

  async updateRecoveryCode(_id: ObjectId, recoveryCode: string): Promise<boolean> {
    let result = await this.userModel.updateOne({ _id }, { $set: { "emailConfirmation.recoveryCode": recoveryCode } })
    return result.modifiedCount === 1
  }

}