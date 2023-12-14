import { LikeDocument, Like } from '../../likes/model/likes-schema';
import { QueryPaginationType } from '../../helpers/query-filter';
import { Comment, CommentDocument, CommentSchema } from '../model/comments-schema';
import { Injectable, HttpStatus, Query } from '@nestjs/common';
import { Injector } from "@nestjs/core/injector/injector"
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { Model } from 'mongoose';
import { Filter, ObjectId } from "mongodb";
import { commentMongoModel, commentViewModel, paginatorComments } from '../model/comments-model';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';


@Injectable()
export class CommentsRepoPSQL {
  constructor(@InjectDataSource() private commentsModel: DataSource) { }

  async createdCommentPostId(postId: string, content: string, userId: string, userLogin: string, createdAt: string): Promise<commentViewModel> {
    const newCommentId = new ObjectId()

    const newComment: commentMongoModel = {
      _id: newCommentId,
      postId: postId,
      content: content,
      commentatorInfo: {
        userId: userId,
        userLogin: userLogin
      },
      createdAt: createdAt,
      //likesInfo: { likesCount: 0, dislikesCount: 0, myStatus: 'None' }
    }


    const newCommentAdd = await this.commentsModel.query(`
      INSERT INTO public."comments"(
      _id, "postId", content, "createdAt", "userId", "userLogin")
      VALUES ('${newCommentId}', '${postId}', '${content}', '${createdAt}', '${userId}', '${userLogin}');
    `)


    return {
      id: newComment._id.toString(),
      content: newComment.content,
      commentatorInfo: {
        userId: userId,
        userLogin: userLogin
      },
      createdAt: newComment.createdAt,
      likesInfo: {
        likesCount: 0,
        dislikesCount: 0,
        myStatus: 'None'
      }
    }
  }

  async updateCommentId(commentsId: string, content: string): Promise<Number> {
    try {
      const post = await this.commentsModel.query(`
      UPDATE public."comments"
      SET content= $2
      WHERE _id= $1
      `, [commentsId, content])
      //updateOne({ _id: new ObjectId(commentsId) }, { $set: { content } })
      if (post[1] > 0) {
        return HttpStatus.NO_CONTENT
      }
      else {
        return HttpStatus.NOT_FOUND
      }
    }
    catch (e) { return HttpStatus.NOT_FOUND }
  }

  async deletCommentById(id: string): Promise<HttpStatus.NO_CONTENT | HttpStatus.NOT_FOUND> {
    try {
      const result = await this.commentsModel.query(`
          DELETE FROM public."comments"
	        WHERE _id = $1
      `, [id])
      //deleteOne({ _id: new ObjectId(id) })
      if (result[1] > 0) {
        return HttpStatus.NO_CONTENT
      }
      else {
        return HttpStatus.NOT_FOUND
      }
    } catch (e) { return HttpStatus.NOT_FOUND }
  }


  async updateLikeStatus(commentId: string, userId: string, likeStatus: string): Promise<HttpStatus.NO_CONTENT | HttpStatus.NOT_FOUND> {
    try {
      const createdAt = (new Date()).toISOString()
      const loginResult = await this.commentsModel.query(`SELECT * FROM public."users"
                                                      WHERE "_id" = $1
      `, [userId])
          //{ _id: new ObjectId(userId) }
      const login = loginResult[0].login
      const statusResult = await this.commentsModel.query(`SELECT * FROM public."likes"
                                                      WHERE "userId" = $1 AND "postIdOrCommentId" = $2
      `, [userId, commentId])

      // const resultLikeStatus = await this.likeModel.findOne({userId: userId, postIdOrCommentId: postId, status: likeStatus})
      if (statusResult.length > 0) {
          const likeResult = await this.commentsModel.query(`UPDATE public."likes"
          SET "userLogin"=$3, status=$4, "createdAt"=$5
          WHERE "userId" = $1 AND "postIdOrCommentId" = $2
          `, [userId, commentId, login, likeStatus, createdAt])
          if (likeResult[1] > 0) {return HttpStatus.NO_CONTENT} 
          return HttpStatus.NOT_FOUND
      } else {
      // if (resultLikeStatus) {return true}
        const likeId = new mongoose.Types.ObjectId()
        const likeResult = await this.commentsModel.query(`
        INSERT INTO public."likes"(
          _id, "userId", "userLogin", "postIdOrCommentId", status, "createdAt")
          VALUES ($1 ,$2, $3, $4, $5, $6)
        `, [likeId,userId, login, commentId, likeStatus, createdAt])
        return HttpStatus.NO_CONTENT
      }
    } catch (e) {
      return HttpStatus.NOT_FOUND
    }
  }

  async deletCommentsAll(): Promise<boolean> {
    const commentsDeleted = await this.commentsModel.query(`
    DELETE FROM public."comments"
    `)
    if (commentsDeleted[1] > 0) { return true }
    return false
}
}

