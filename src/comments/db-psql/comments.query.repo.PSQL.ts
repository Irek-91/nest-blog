import { LikeDocument, Like } from '../../likes/model/likes-schema';
import { QueryPaginationType } from '../../helpers/query-filter';
import { Comment, CommentDocument, CommentSchema } from '../model/comments-schema';
import { Injectable, HttpStatus, HttpException } from '@nestjs/common';
import { Injector } from "@nestjs/core/injector/injector"
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Filter, ObjectId } from "mongodb";
import { commentMongoModel, commentViewModel, paginatorComments } from '../model/comments-model';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { log } from 'console';


@Injectable()
export class CommentsQueryRepoPSQL {
  constructor(@InjectDataSource() private commetsModel: DataSource) { }

  async findCommentById(commentId: string, userId: string | null): Promise<commentViewModel | null> {
    try {

      const comment = await this.commetsModel.query(`
            SELECT * FROM public."comments"
            WHERE "_id" = $1
      `, [commentId])

      //commentModel.findOne({ _id: new ObjectId(commentId) })
      if (comment.length === 0) {
        return null
      }
      let myStatus = 'None'
      if (userId) {
        const status = await this.commetsModel.query(`
              SELECT * FROM public."likes"
              WHERE "postIdOrCommentId" = $1 AND "userId" = $2
        `, [commentId, userId])
        //likeModel.findOne({ postIdOrCommentId: commentId, userId })
        if (status.length > 0) {
          myStatus = status[0].status
        }
      }

      const likes = await this.commetsModel.query(`
          SELECT * FROM public."likes"
          WHERE "postIdOrCommentId" = $1 AND status = 'Like'
      `, [commentId])

      const likesCount = likes.length

      const dislikes = await this.commetsModel.query(`
          SELECT * FROM public."likes"
          WHERE "postIdOrCommentId" = $1 AND status = 'Dislike'
      `, [commentId])
      const dislikesCount = dislikes.length

      const commentViewModel: commentViewModel = {
        id: comment[0]._id.toString(),
        content: comment[0].content,
        commentatorInfo: {
          userId: comment[0].userId,
          userLogin: comment[0].userLogin
        },
        createdAt: comment[0].createdAt,
        likesInfo: {
          likesCount: likesCount,
          dislikesCount: dislikesCount,
          myStatus
        }
      }
      return commentViewModel
    }
    catch (e) {
      return null
    }
  }

  async findCommentsByPostId(postId: string, userId: string | null, pagination: QueryPaginationType): Promise<paginatorComments> {
    try {
      const filter = `SELECT * FROM public."comments"
                      WHERE "postId" = $1
                      ORDER BY "${pagination.sortBy}" ${pagination.sortDirection}`
      const comments = await this.commetsModel.query(filter + ` LIMIT $2 OFFSET $3`,
        [postId, pagination.pageSize, pagination.skip])
      //commentModel.find(filter).
      //sort([[pagination.sortBy, pagination.sortDirection]]).
      //skip(pagination.skip).
      //limit(pagination.pageSize).
      //lean()
      const totalCOunt = (await this.commetsModel.query(filter, [postId])).length
      const pagesCount = Math.ceil(totalCOunt / pagination.pageSize)
      const mappedComments: commentViewModel[] = await Promise.all(comments.map(async c => {
        let myStatus = 'None'
        const commentsId = c._id.toString()

        if (userId) {
          const status = await this.commetsModel.query(`SELECT * FROM public."likes"
                                                     WHERE "userId" = $1 AND "postIdOrCommentId" = $2
          `, [userId, c._id])
          if (status.length > 0) {
            myStatus = status[0].status
          }
        }
        const likes = await this.commetsModel.query(`
        SELECT * FROM public."likes"
        WHERE "postIdOrCommentId" = $1 AND status = 'Like'
        `, [commentsId])

        const likesCount = likes.length

        const dislikes = await this.commetsModel.query(`
        SELECT * FROM public."likes"
        WHERE "postIdOrCommentId" = $1 AND status = 'Dislike'
        `, [commentsId])
        const dislikesCount = dislikes.length

        return {
          id: commentsId,
          content: c.content,
          commentatorInfo: {
            userId: c.userId,
            userLogin: c.userLogin
          },
          createdAt: c.createdAt,
          likesInfo: {
            likesCount:likesCount,
            dislikesCount: dislikesCount,
            myStatus: myStatus
          }
        }
      }))

      return {
        pagesCount: pagesCount,
        page: pagination.pageNumber,
        pageSize: pagination.pageSize,
        totalCount: totalCOunt,
        items: mappedComments
      }
    } catch (e) { throw new HttpException('Not found', HttpStatus.NOT_FOUND) }
  }
}

