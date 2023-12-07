import { LikeDocument, Like } from '../../likes/model/likes-schema';
import { QueryPaginationType } from '../../helpers/query-filter';
import { Comment, CommentDocument, CommentSchema } from '../model/comments-schema';
import { Injectable, HttpStatus, HttpException } from '@nestjs/common';
import { Injector } from "@nestjs/core/injector/injector"
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Filter, ObjectId } from "mongodb";
import { commentMongoModel, commentViewModel, paginatorComments } from '../model/comments-model';


@Injectable()
export class CommentsQueryRepository {
  constructor(@InjectModel(Comment.name) private commentModel: Model<CommentDocument>,
    @InjectModel(Like.name) private likeModel: Model<LikeDocument>) { }

  async findCommentById(commentId: string, userId: string | null): Promise<commentViewModel | null> {
    try {
      const comment = await this.commentModel.findOne({ _id: new ObjectId(commentId) })
      if (!comment) {
        return null
      }

      let myStatus = 'None'

      if (userId) {
        const status = await this.likeModel.findOne({ postIdOrCommentId: commentId, userId })
        if (status) {
          myStatus = status.status
        }
      }
      const likeCount = await this.likeModel.countDocuments({ postIdOrCommentId: commentId, status: 'Like' })
      const dislikesCount = await this.likeModel.countDocuments({ postIdOrCommentId: commentId, status: 'Dislike' })
      const commentViewModel: commentViewModel = {
        id: comment._id.toString(),
        content: comment.content,
        commentatorInfo: comment.commentatorInfo,
        createdAt: comment.createdAt,
        likesInfo: {
          likesCount: likeCount,
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
      const filter = { postId: postId }
      const comments = await this.commentModel.find(filter).
        //sort([[pagination.sortBy, pagination.sortDirection]]).
        skip(pagination.skip).
        limit(pagination.pageSize).
        lean()
      const totalCOunt = await this.commentModel.countDocuments(filter)
      const pagesCount = Math.ceil(totalCOunt / pagination.pageSize)

      const mappedComments: commentViewModel[] = await Promise.all(comments.map(async c => {
        let myStatus = 'None'
        const commentsId = c._id.toString()

        if (userId) {
          const status = await this.likeModel.findOne({ postIdOrCommentId: commentsId, userId })
          if (status) {
            myStatus = status.status
          }
        }
        return {
          id: commentsId,
          content: c.content,
          commentatorInfo: c.commentatorInfo,
          createdAt: c.createdAt,
          likesInfo: {
            likesCount: await this.likeModel.countDocuments({ postIdOrCommentId: commentsId, status: 'Like' }),
            dislikesCount: await this.likeModel.countDocuments({ postIdOrCommentId: commentsId, status: 'Dislike' }),
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

