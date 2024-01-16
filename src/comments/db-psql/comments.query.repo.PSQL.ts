import { Like } from './../../likes/entity/likes.entity';
import { queryPaginationType } from '../../helpers/query-filter';
import { Injectable, HttpStatus, HttpException } from '@nestjs/common';
import { commentMongoModel, commentViewModel, paginatorComments } from '../model/comments-model';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { log } from 'console';
import { Comment } from './entity/comments.entity';


@Injectable()
export class CommentsQueryRepoPSQL {
  constructor(@InjectDataSource() private commetsModel: DataSource) { }

  async findCommentById(commentId: string, userId: string | null): Promise<commentViewModel | null> {
    try {

      const comment = await this.commetsModel.getRepository(Comment)
        .createQueryBuilder('c')
        .leftJoinAndSelect('c.userId', 'u')
        .where({
          _id: commentId
        }).getOne()


      if (!comment) {
        return null
      }
      let myStatus = 'None'
      
      if (userId) {
        const status = await this.commetsModel.getRepository(Like)
          .createQueryBuilder('l')
          .leftJoinAndSelect('l.userId', 'u')
          .where('u._id = :userId', { userId: userId })
          .andWhere('l.postIdOrCommentId = :postIdOrCommentId', { postIdOrCommentId: commentId })
          .getOne()
        if (status) {
          myStatus = status.status
        }
      }
      const likesCount = await this.commetsModel.getRepository(Like).createQueryBuilder()
        .select()
        .where({
          postIdOrCommentId: commentId
        })
        .andWhere({
          status: 'Like'
        })
        .getCount()
      const dislikesCount = await this.commetsModel.getRepository(Like).createQueryBuilder()
        .select()
        .where({
          postIdOrCommentId: commentId
        })
        .andWhere({
          status: 'Dislike'
        })
        .getCount()
      // query(`
      //     SELECT * FROM public."likes"
      //     WHERE "postIdOrCommentId" = $1 AND status = 'Dislike'
      // `, [commentId])
      // const dislikesCount = dislikes.length

      const commentViewModel: commentViewModel = {
        id: comment._id,
        content: comment.content,
        commentatorInfo: {
          userId: comment.userId._id,
          userLogin: comment.userId.login
        },
        createdAt: comment.createdAt,
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

  async findCommentsByPostId(postId: string, userId: string | null, pagination: queryPaginationType): Promise<paginatorComments> {
    try {
      // const filter = `SELECT * FROM public."comments"
      //                 WHERE "postId" = $1
      //                 ORDER BY "${pagination.sortBy}" ${pagination.sortDirection}`


      // const comments = await this.commetsModel.query(filter + ` LIMIT $2 OFFSET $3`,
      //   [postId, pagination.pageSize, pagination.skip])

      const totalCount = await this.commetsModel.getRepository(Comment)
        .createQueryBuilder('c')
        .where('c.postId = :postId', { postId: postId })
        .getCount()


      const comments = await this.commetsModel.getRepository(Comment)
        .createQueryBuilder('c')
        //.leftJoinAndSelect('c.postId', 'p')
        .leftJoinAndSelect('c.userId', 'u')
        .where('c.postId = :postId', { postId: postId })
        .orderBy(`c.${pagination.sortBy}`, pagination.sortDirection)
        .skip(pagination.skip)
        .take(pagination.pageSize)
        .getMany()

      // if (!comments) { }

      const pagesCount = Math.ceil(totalCount / pagination.pageSize)
      


      const mappedComments: any = await Promise.all(comments.map(async c => {

        let myStatus = 'None'
        const commentId = c._id.toString()

        if (userId) {
          const status = await this.commetsModel.getRepository(Like)
            .createQueryBuilder('l')
            .leftJoinAndSelect('l.userId', 'u')
            .where('u._id = :userId', { userId: userId })
            .andWhere('l.postIdOrCommentId = :postIdOrCommentId', { postIdOrCommentId: commentId })
            .getOne()
          if (status) {
            myStatus = status.status
          }
        }
        const likesCount = await this.commetsModel.getRepository(Like).createQueryBuilder()
          .select()
          .where({
            postIdOrCommentId: commentId
          })
          .andWhere({
            status: 'Like'
          })
          .getCount()

        const dislikesCount = await this.commetsModel.getRepository(Like).createQueryBuilder()
          .select()
          .where({
            postIdOrCommentId: commentId
          })
          .andWhere({
            status: 'Dislike'
          })
          .getCount()


        return {
          id: commentId,
          content: c.content,
          commentatorInfo: {
            userId: c.userId._id,
            userLogin: c.userId.login
          },
          createdAt: c.createdAt,
          likesInfo: {
            likesCount: likesCount,
            dislikesCount: dislikesCount,
            myStatus: myStatus
          }
        }
      }
      ))
    
    return {
      pagesCount: pagesCount,
      page: pagination.pageNumber,
      pageSize: pagination.pageSize,
      totalCount: totalCount,
      items: mappedComments
    }
  } catch(e) { throw new HttpException('Not found', HttpStatus.NOT_FOUND) }
}
}

