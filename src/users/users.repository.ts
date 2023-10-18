import { HttpCode, HttpStatus, Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { User, UserDocument } from "./models/users-schema";
import { Filter, ObjectId } from "mongodb";
import { userMongoModel, userViewModel } from "./models/users-model";
import { QueryPaginationTypeUser } from 'src/helpers/query-filter';
import { log } from "console";



@Injectable()

export class UsersRepository {
  constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) { }

  async findUsers(paginatorUser: QueryPaginationTypeUser) {
    const filter: Filter<userMongoModel> = {};

    if (paginatorUser.searchLoginTerm || paginatorUser.searchEmailTerm) {
      filter.$or = []
      if (paginatorUser.searchLoginTerm) {
        filter.$or.push({ 'accountData.login': { $regex: paginatorUser.searchLoginTerm, $options: 'i' } })
      }
      if (paginatorUser.searchEmailTerm) {
        filter.$or.push({ 'accountData.email': { $regex: paginatorUser.searchEmailTerm, $options: 'i' } })
      }

    }

    const users = await this.userModel.find().
      where(filter).
      sort([[`accountData.${paginatorUser.sortBy}`, paginatorUser.sortDirection]]).
      skip(paginatorUser.skip).
      limit(paginatorUser.pageSize).
      lean()
    const totalCount = await this.userModel.countDocuments([filter])
    const usersOutput: userViewModel[] = users.map((b) => {
      return {
        id: b._id.toString(),
        login: b.accountData!.login,
        email: b.accountData!.email,
        createdAt: b.accountData!.createdAt,
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

  async deleteUserId(userId: string): Promise<Number> {
    try {
      let user = await this.userModel.deleteOne({ _id: new ObjectId(userId) })
      if (user.deletedCount) {
        return HttpStatus.NO_CONTENT
      } else {return HttpStatus.NOT_FOUND}
    }
    catch (e) { return HttpStatus.NOT_FOUND }
  }

  
  async deleteUsers(): Promise<Number> {
    try {
      let user = await this.userModel.deleteMany()
      if (user.deletedCount) {
        return HttpStatus.NO_CONTENT
      } else {return HttpStatus.NOT_FOUND}
    }
    catch (e) { return HttpStatus.NOT_FOUND }
  }

  async findUserById(userId: ObjectId): Promise<UserDocument | false> {
    try {
      let user = await this.userModel.findOne({ _id: userId });
      if (user === null) {
        return false
      }
      else {
        return user
      }
    } catch (e) { return false }
  }

}