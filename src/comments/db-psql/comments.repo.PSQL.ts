import { Injectable } from '@nestjs/common';
import { commentMongoModel, commentViewModel } from '../model/comments-model';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';
import { Comment } from './entity/comments.entity';
import { Like } from '../../likes/entity/likes.entity';

@Injectable()
export class CommentsRepoPSQL {
  constructor(@InjectDataSource() private commentsModel: DataSource) {}

  async createdCommentPostId(
    postId: string,
    content: string,
    userId: string,
    userLogin: string,
    createdAt: string,
  ): Promise<commentViewModel> {
    const newCommentId = uuidv4();

    const newComment: commentMongoModel = {
      _id: newCommentId,
      postId: postId,
      content: content,
      commentatorInfo: {
        userId: userId,
        userLogin: userLogin,
      },
      createdAt: createdAt,
      //likesInfo: { likesCount: 0, dislikesCount: 0, myStatus: 'None' }
    };

    const newCommentAdd = await this.commentsModel
      .createQueryBuilder()
      .insert()
      .into(Comment)
      .values({
        _id: newCommentId,
        postId: { _id: postId },
        content: content,
        createdAt: createdAt,
        userId: { _id: userId },
      })
      .execute();
    // query(`
    //   INSERT INTO public."comments"(
    //   _id, "postId", content, "createdAt", "userId", "userLogin")
    //   VALUES ('${newCommentId}', '${postId}', '${content}', '${createdAt}', '${userId}', '${userLogin}');
    // `)
    return {
      id: newComment._id.toString(),
      content: newComment.content,
      commentatorInfo: {
        userId: userId,
        userLogin: userLogin,
      },
      createdAt: newComment.createdAt,
      likesInfo: {
        likesCount: 0,
        dislikesCount: 0,
        myStatus: 'None',
      },
    };
  }

  async updateCommentId(
    commentsId: string,
    content: string,
  ): Promise<true | null> {
    try {
      const post = await this.commentsModel
        .createQueryBuilder()
        .update(Comment)
        .set({
          content: content,
        })
        .where({
          _id: commentsId,
        })
        .execute();
      if (!post) {
        return null;
      } else {
        return true;
      }
    } catch (e) {
      return null;
    }
  }

  async deletCommentById(id: string): Promise<true | null> {
    try {
      const result = await this.commentsModel
        .createQueryBuilder()
        .delete()
        .from(Comment)
        .where({
          _id: id,
        })
        .execute();
      // query(`
      //     DELETE FROM public."comments"
      //     WHERE _id = $1
      // `, [id])
      //deleteOne({ _id: new ObjectId(id) })
      if (!result) {
        return null;
      } else {
        return true;
      }
    } catch (e) {
      return null;
    }
  }

  async updateLikeStatus(
    commentId: string,
    userId: string,
    likeStatus: string,
  ): Promise<true | null> {
    try {
      const createdAt = new Date().toISOString();

      const statusResult = await this.commentsModel
        .getRepository(Like)
        .createQueryBuilder()
        .select()
        .where({ userId: userId })
        .andWhere({ postIdOrCommentId: commentId })
        .getOne();
      // query(`SELECT * FROM public."likes"
      //                                                 WHERE "userId" = $1 AND "postIdOrCommentId" = $2
      // `, [userId, commentId])

      if (statusResult) {
        const likeResult = await this.commentsModel
          .createQueryBuilder()
          .update(Like)
          .set({
            status: likeStatus,
            createdAt: createdAt,
          })
          .where({ userId: userId })
          .andWhere({ postIdOrCommentId: commentId })
          .execute();
        // query(`UPDATE public."likes"
        // SET "userLogin"=$3, status=$4, "createdAt"=$5
        // WHERE "userId" = $1 AND "postIdOrCommentId" = $2
        // `, [userId, commentId, login, likeStatus, createdAt])

        if (!likeResult) {
          return null;
        }
        return true;
      } else {
        const likeId = uuidv4();

        const likeResult = await this.commentsModel
          .createQueryBuilder()
          .insert()
          .into(Like)
          .values({
            _id: likeId,
            userId: { _id: userId },
            postIdOrCommentId: commentId,
            status: likeStatus,
            createdAt: createdAt,
          })
          .execute();

        // query(`
        // INSERT INTO public."likes"(
        //   _id, "userId", "userLogin", "postIdOrCommentId", status, "createdAt")
        //   VALUES ($1 ,$2, $3, $4, $5, $6)
        // `, [likeId,userId, login, commentId, likeStatus, createdAt])

        return true;
      }
    } catch (e) {
      return null;
    }
  }

  async deletCommentsAll(): Promise<boolean> {
    const commentsDeleted = await this.commentsModel
      .createQueryBuilder()
      .delete()
      .from(Comment)
      .execute();
    // query(`
    // DELETE FROM public."comments"
    // `)
    if (!commentsDeleted) {
      return false;
    }
    return true;
  }
}
