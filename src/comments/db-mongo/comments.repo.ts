// import { LikeDocument, Like } from '../../likes/model/likes-schema';
// import { queryPaginationType } from '../../helpers/query-filter';
// import { Comment, CommentDocument, CommentSchema } from '../model/comments-schema';
// import { Injectable, HttpStatus } from '@nestjs/common';
// import { Injector } from "@nestjs/core/injector/injector"
// import { InjectModel } from '@nestjs/mongoose';
// import { Model } from 'mongoose';
// import { Filter, ObjectId } from "mongodb";
// import { commentMongoModel, commentViewModel, paginatorComments } from '../model/comments-model';

// @Injectable()
// export class CommentsRepository {
//   constructor(@InjectModel(Comment.name) private commentModel: Model<CommentDocument>,
//     @InjectModel(Like.name) private likeModel: Model<LikeDocument>) { }

//   async createdCommentPostId(postId: string, content: string, userId: string, userLogin: string, createdAt: string): Promise<commentViewModel> {
//     const newCommentId = new ObjectId()

//     const newComment: commentMongoModel = {
//       _id: newCommentId,
//       postId: postId,
//       content: content,
//       commentatorInfo: {
//         userId: userId,
//         userLogin: userLogin
//       },
//       createdAt: createdAt,
//       //likesInfo: { likesCount: 0, dislikesCount: 0, myStatus: 'None' }
//     }

//     const commentsInstance = new this.commentModel(newComment)
//     await commentsInstance.save()

//     return {
//       id: commentsInstance._id.toString(),
//       content: commentsInstance.content,
//       commentatorInfo: {
//         userId: userId,
//         userLogin: userLogin
//       },
//       createdAt: commentsInstance.createdAt,
//       likesInfo: {
//         likesCount: 0,
//         dislikesCount: 0,
//         myStatus: 'None'
//       }
//     }
//   }

//   async updateCommentId(commentsId: string, content: string): Promise<Number> {
//     try {
//       const post = await this.commentModel.updateOne({ _id: new ObjectId(commentsId) }, { $set: { content } })
//       if (post.matchedCount) {
//         return HttpStatus.NO_CONTENT
//       }
//       else {
//         return HttpStatus.NOT_FOUND
//       }
//     }
//     catch (e) { return HttpStatus.NOT_FOUND }
//   }

//   async deletCommentById(id: string): Promise<HttpStatus.NO_CONTENT | HttpStatus.NOT_FOUND> {
//     try {
//       const result = await this.commentModel.deleteOne({ _id: new ObjectId(id) })
//       if (result.deletedCount) {
//         return HttpStatus.NO_CONTENT
//       }
//       else {
//         return HttpStatus.NOT_FOUND
//       }
//     } catch (e) { return HttpStatus.NOT_FOUND }
//   }

//   async updateLikeStatus(commentId: string, userId: string, likeStatus: string): Promise<HttpStatus.NO_CONTENT | HttpStatus.NOT_FOUND> {
//     try {
//       const comment = await this.commentModel.findOne({ _id: new ObjectId(commentId) })
//       if (!comment) { return HttpStatus.NOT_FOUND }
//       await this.likeModel.updateOne(
//         { postIdOrCommentId: commentId, userId },
//         { $set: { status: likeStatus, createdAt: new Date().toISOString() } },
//         { upsert: true }
//       )
//       return HttpStatus.NO_CONTENT

//     } catch (e) {
//       return HttpStatus.NOT_FOUND
//     }
//   }
// }
