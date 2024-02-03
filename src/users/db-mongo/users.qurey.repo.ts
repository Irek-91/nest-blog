// import { queryPaginationTypeUser } from '../../helpers/query-filter';
// import { HttpCode, HttpStatus, Injectable, HttpException } from "@nestjs/common";
// import { InjectModel } from "@nestjs/mongoose";
// import { FilterQuery, Model } from "mongoose";
// import { User, UserDocument } from "../models/users-schema";
// import mongoose, { ObjectId } from "mongoose";
// import { userMongoModel, userViewModel } from "../models/users-model";
// import { log } from "console";



// @Injectable()

// export class UsersQueryRepository {
//   constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) { }

//   async findUsers(paginatorUser: queryPaginationTypeUser) {
//     const filter:  FilterQuery<userMongoModel> = {};

//     if (paginatorUser.searchLoginTerm || paginatorUser.searchEmailTerm) {
//       filter.$or = []
//       if (paginatorUser.searchLoginTerm) {
//         filter.$or.push({ 'accountData.login': { $regex: paginatorUser.searchLoginTerm, $options: 'i' } })
//       }
//       if (paginatorUser.searchEmailTerm) {
//         filter.$or.push({ 'accountData.email': { $regex: paginatorUser.searchEmailTerm, $options: 'i' } })
//       }
//     }
//     const users = await this.userModel.find().
//       where(filter).
//       //sort([[`accountData.${paginatorUser.sortBy}`, paginatorUser.sortDirection]]).
//       skip(paginatorUser.skip).
//       limit(paginatorUser.pageSize).
//       lean()
//     const totalCount = await this.userModel.countDocuments(filter)
//     const usersOutput: userViewModel[] = users.map((b) => {
//       return {
//         id: b._id.toString(),
//         login: b.accountData!.login,
//         email: b.accountData!.email,
//         createdAt: b.accountData!.createdAt,
//       }
//     })

//     return {
//       pagesCount: Math.ceil(totalCount / paginatorUser.pageSize),
//       page: paginatorUser.pageNumber,
//       pageSize: paginatorUser.pageSize,
//       totalCount: totalCount,
//       items: usersOutput
//     }
//   }

//   async findUserById(userId: mongoose.Types.ObjectId): Promise<UserDocument> {
//     try {
//       let user = await this.userModel.findOne({ _id: userId });
//       if (user === null) {
//         throw new HttpException ('Not found',HttpStatus.NOT_FOUND)
//       }
//       else {
//         return user
//       }
//     } catch (e) { throw new HttpException ('Not found',HttpStatus.NOT_FOUND) }
//   }

//   async findByLoginOrEmailL(loginOrEmail: string): Promise<UserDocument | HttpStatus.NOT_FOUND> {
//     const user = await this.userModel.findOne({ $or: [{ 'accountData.email': loginOrEmail }, { 'accountData.login': loginOrEmail }] }).lean()
//     if (user === null) {
//       return HttpStatus.NOT_FOUND
//     }
//     else {
//       return user
//     }
//   }


//   async findUserByCode(code: string): Promise<UserDocument | null> {
//     try {
//       return this.userModel.findOne({ "emailConfirmation.confirmationCode": code })
//     }
//     catch (e) {
//        return null
//        }
//   }

//   async findUserByEmail(email: string): Promise<UserDocument | null> {
//     try {
//       return this.userModel.findOne({ "accountData.email": email })
//     }
//     catch (e) { return null }
//   }

//   async findUserByLogin(login: string): Promise<UserDocument | HttpStatus.NOT_FOUND> {
//     try {
//       let user = await this.userModel.findOne({ "accountData.login": login }).lean()
//       if (user !== null) {
//         return user
//       } else {
//         return HttpStatus.NOT_FOUND
//       }
//     }
//     catch (e) { return HttpStatus.NOT_FOUND }
//   }


//   async findUserByRecoveryCode(recoveryCode: string): Promise<UserDocument | null> {
//     try {
//       let user = await this.userModel.findOne({ "emailConfirmation.recoveryCode": recoveryCode }).lean()
//       if (user !== null) {
//         return user
//       } else {
//         return null
//       }
//     }
//     catch (e) {
//       return null
//     }
//   }
// }