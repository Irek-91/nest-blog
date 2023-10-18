import { Comment, CommentDocument, CommentSchema } from './model/comments-schema';
import { Injectable } from '@nestjs/common';
import { Injector } from "@nestjs/core/injector/injector"
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Filter, ObjectId } from "mongodb";
import { commentMongoModel, commentViewModel, paginatorComments } from './model/comments-model';
import { QueryPaginationType } from 'src/helpers/query-filter';
import { Like, LikeDocument } from 'src/likes/model/likes-schema';


@Injectable()
export class CommentsRepository {
    constructor(@InjectModel(Comment.name) private commentModel: Model<CommentDocument>,
    @InjectModel(Like.name) private likeModel: Model<LikeDocument> ) {}
    
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
  
  
      const commentsInstance = new this.commentModel (newComment)
      await commentsInstance.save()
  
  
      return {
        id: commentsInstance._id.toString(),
        content: commentsInstance.content,
        commentatorInfo: {
          userId: userId,
          userLogin: userLogin
        },
        createdAt: commentsInstance.createdAt,
        likesInfo: {
          likesCount: 0,
          dislikesCount: 0,
          myStatus: 'None'
        }
      }
    }
  
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
  
    async updateCommentId(commentsId: string, content: string): Promise<true | null> {
      try {
        const post = await this.commentModel.updateOne({ _id: new ObjectId(commentsId) }, { $set: { content } })
        if (post.matchedCount) {
          return true
        }
        else {
          return null
        }
      }
      catch (e) { return null }
    }
  
    async deletCommentById(id: string): Promise<true | null> {
      try {
        const result = await this.commentModel.deleteOne({ _id: new ObjectId(id) })
        if (result.deletedCount) {
          return true
        }
        else {
          return null
        }
      } catch (e) { return null }
    }
  
    async findCommentsByPostId(postId: string, userId: string | null, pagination: QueryPaginationType): Promise<paginatorComments | null> {
      try {
        const filter = { postId: postId }
        const comments = await this.commentModel.find(filter).
          sort([[pagination.sortBy, pagination.sortDirection]]).
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
      } catch (e) { return null }
    }
  
    async updateLikeStatus(commentId: string, userId: string, likeStatus: string): Promise<boolean | null> {
      try {
        const comment = await this.commentModel.findOne({ _id: new ObjectId(commentId) })
        if (!comment) { return null }
        await this.likeModel.updateOne(
          { postIdOrCommentId: commentId, userId },
          { $set: { status: likeStatus, createdAt: new Date().toISOString() } },
          { upsert: true }
        )
        return true
  
      } catch (e) {
        console.log(e) 
        return null
       }
    }
  
    async deleteCommentsAll(): Promise<boolean> {
      const deletResult = await this.commentModel.deleteMany({})
      const deletResult1 = await this.likeModel.deleteMany({})
      return true
    }
  }
  
  