import {
  paginationGetCommentsByBlog,
  getCommentsByBlog,
} from './../model/comments-model';
import { Like } from './../../likes/entity/likes.entity';
import { queryPaginationType } from '../../helpers/query-filter';
import { Injectable } from '@nestjs/common';
import { commentViewModel, paginatorComments } from '../model/comments-model';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { Comment } from './entity/comments.entity';

@Injectable()
export class CommentsQueryRepoPSQL {
  constructor(@InjectDataSource() private dataSource: DataSource) {}

  async findCommentById(
    commentId: string,
    userId: string | null,
  ): Promise<commentViewModel | null> {
    try {
      const comment = await this.dataSource
        .getRepository(Comment)
        .createQueryBuilder('c')
        .leftJoinAndSelect('c.userId', 'u')
        .where('u.status = :status', { status: false })
        .andWhere({
          _id: commentId,
        })
        .getOne();

      if (!comment) {
        return null;
      }
      let myStatus = 'None';

      if (userId) {
        const status = await this.dataSource
          .getRepository(Like)
          .createQueryBuilder('l')
          .leftJoinAndSelect('l.userId', 'u')
          .where('u._id = :userId', { userId: userId })
          .andWhere('u.status = :status', { status: false })
          .andWhere('l.postIdOrCommentId = :postIdOrCommentId', {
            postIdOrCommentId: commentId,
          })
          .getOne();
        if (status) {
          myStatus = status.status;
        }
      }
      const likesCount = await this.dataSource
        .getRepository(Like)
        .createQueryBuilder('l')
        .leftJoinAndSelect('l.userId', 'u')
        .select()
        .where({
          postIdOrCommentId: commentId,
        })
        .andWhere('u.status = :status', { status: false })
        .andWhere({
          status: 'Like',
        })
        .getCount();

      const dislikesCount = await this.dataSource
        .getRepository(Like)
        .createQueryBuilder('l')
        .leftJoinAndSelect('l.userId', 'u')
        .select()
        .where({
          postIdOrCommentId: commentId,
        })
        .andWhere('u.status = :status', { status: false })
        .andWhere({
          status: 'Dislike',
        })
        .getCount();
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
          userLogin: comment.userId.login,
        },
        createdAt: comment.createdAt,
        likesInfo: {
          likesCount: likesCount,
          dislikesCount: dislikesCount,
          myStatus,
        },
      };
      return commentViewModel;
    } catch (e) {
      return null;
    }
  }

  async findCommentsByPostId(
    postId: string,
    userId: string | null,
    pagination: queryPaginationType,
  ): Promise<paginatorComments | null> {
    try {
      // const filter = `SELECT * FROM public."comments"
      //                 WHERE "postId" = $1
      //                 ORDER BY "${pagination.sortBy}" ${pagination.sortDirection}`

      // const comments = await this.dataSource.query(filter + ` LIMIT $2 OFFSET $3`,
      //   [postId, pagination.pageSize, pagination.skip])

      const totalCount = await this.dataSource
        .getRepository(Comment)
        .createQueryBuilder('c')
        .where('c.postId = :postId', { postId: postId })
        .getCount();

      const comments = await this.dataSource
        .getRepository(Comment)
        .createQueryBuilder('c')
        //.leftJoinAndSelect('c.postId', 'p')
        .leftJoinAndSelect('c.userId', 'u')
        .where('u.status = :status', { status: false })
        .andWhere('c.postId = :postId', { postId: postId })
        .orderBy(`c.${pagination.sortBy}`, pagination.sortDirection)
        .skip(pagination.skip)
        .take(pagination.pageSize)
        .getMany();

      // if (!comments) { }

      const pagesCount = Math.ceil(totalCount / pagination.pageSize);

      const mappedComments: any = await Promise.all(
        comments.map(async (c) => {
          let myStatus = 'None';
          const commentId = c._id.toString();

          if (userId) {
            const status = await this.dataSource
              .getRepository(Like)
              .createQueryBuilder('l')
              .leftJoinAndSelect('l.userId', 'u')
              .where('u._id = :userId', { userId: userId })
              .andWhere('u.status = :status', { status: false })
              .andWhere('l.postIdOrCommentId = :postIdOrCommentId', {
                postIdOrCommentId: commentId,
              })
              .getOne();
            if (status) {
              myStatus = status.status;
            }
          }
          const likesCount = await this.dataSource
            .getRepository(Like)
            .createQueryBuilder('l')
            .leftJoinAndSelect('l.userId', 'u')
            .select()
            .where({
              postIdOrCommentId: commentId,
            })
            .andWhere('u.status = :status', { status: false })
            .andWhere({
              status: 'Like',
            })
            .getCount();

          const dislikesCount = await this.dataSource
            .getRepository(Like)
            .createQueryBuilder('l')
            .leftJoinAndSelect('l.userId', 'u')
            .select()
            .where({
              postIdOrCommentId: commentId,
            })
            .andWhere('u.status = :status', { status: false })
            .andWhere({
              status: 'Dislike',
            })
            .getCount();

          return {
            id: commentId,
            content: c.content,
            commentatorInfo: {
              userId: c.userId._id,
              userLogin: c.userId.login,
            },
            createdAt: c.createdAt,
            likesInfo: {
              likesCount: likesCount,
              dislikesCount: dislikesCount,
              myStatus: myStatus,
            },
          };
        }),
      );

      return {
        pagesCount: pagesCount,
        page: pagination.pageNumber,
        pageSize: pagination.pageSize,
        totalCount: totalCount,
        items: mappedComments,
      };
    } catch (e) {
      return null;
    }
  }

  async findCommentsByBlog(
    blogId: string,
    userId: string,
    pagination: queryPaginationType,
  ): Promise<paginationGetCommentsByBlog | null> {
    try {
      const totalCount = await this.dataSource
        .getRepository(Comment)
        .createQueryBuilder('c')
        .leftJoinAndSelect('c.userId', 'u')
        .leftJoinAndSelect('c.postId', 'p')
        .leftJoinAndSelect('p.blogId', 'b')
        .where('u.status = :status', { status: false })
        //.andWhere('b', {_id: blogId} )
        .getCount();

      const comments = await this.dataSource
        .getRepository(Comment)
        .createQueryBuilder('c')
        //.leftJoinAndSelect('c.postId', 'p')
        .leftJoinAndSelect('c.userId', 'u')
        .leftJoinAndSelect('c.postId', 'p')
        .leftJoinAndSelect('p.blogId', 'b')
        .where('u.status = :status', { status: false })
        //.andWhere('p.blogId = :blog', { blog: {_id: blogId }})
        .orderBy(`c.${pagination.sortBy}`, pagination.sortDirection)
        .skip(pagination.skip)
        .take(pagination.pageSize)
        .getMany();

      const pagesCount = Math.ceil(totalCount / pagination.pageSize);

      const mappedComments: getCommentsByBlog[] = await Promise.all(
        comments.map(async (c) => {
          let myStatus = 'None';
          const commentId = c._id.toString();

          if (userId) {
            const status = await this.dataSource
              .getRepository(Like)
              .createQueryBuilder('l')
              .leftJoinAndSelect('l.userId', 'u')
              .where('u._id = :userId', { userId: userId })
              .andWhere('u.status = :status', { status: false })
              .andWhere('l.postIdOrCommentId = :postIdOrCommentId', {
                postIdOrCommentId: commentId,
              })
              .getOne();
            if (status) {
              myStatus = status.status;
            }
          }
          const likesCount = await this.dataSource
            .getRepository(Like)
            .createQueryBuilder('l')
            .leftJoinAndSelect('l.userId', 'u')
            .select()
            .where({
              postIdOrCommentId: commentId,
            })
            .andWhere('u.status = :status', { status: false })
            .andWhere({
              status: 'Like',
            })
            .getCount();

          const dislikesCount = await this.dataSource
            .getRepository(Like)
            .createQueryBuilder('l')
            .leftJoinAndSelect('l.userId', 'u')
            .select()
            .where({
              postIdOrCommentId: commentId,
            })
            .andWhere('u.status = :status', { status: false })
            .andWhere({
              status: 'Dislike',
            })
            .getCount();

          return {
            id: commentId,
            content: c.content,
            createdAt: c.createdAt,
            commentatorInfo: {
              userId: c.userId._id,
              userLogin: c.userId.login,
            },
            likesInfo: {
              likesCount: likesCount,
              dislikesCount: dislikesCount,
              myStatus: myStatus,
            },
            postInfo: {
              id: c.postId._id,
              title: c.postId.title,
              blogId: c.postId.blogId._id,
              blogName: c.postId.blogId.name,
            },
          };
        }),
      );

      return {
        pagesCount: pagesCount,
        page: pagination.pageNumber,
        pageSize: pagination.pageSize,
        totalCount: totalCount,
        items: mappedComments,
      };
    } catch (e) {
      return null;
    }
  }
}
