import { QueryPaginationType } from './../helpers/query-filter';
import { UsersRepository } from '../users/db-mongo/users.repo';
import { UsersQueryRepository } from '../users/db-mongo/users.qurey.repo';
import { Injectable, HttpStatus } from '@nestjs/common';
import { CommentsRepository } from './comments.repo';
import { commentViewModel, paginatorComments } from './model/comments-model';
import { Filter, ObjectId } from "mongodb";
import { CommentsQueryRepository } from './comments.query.repo';


@Injectable()

export class CommentsService {
    constructor(protected usersRepository: UsersRepository, 
        protected usersQueryRepository:UsersQueryRepository, 
        protected commentsRepository: CommentsRepository,
        protected commentsQueryRepository: CommentsQueryRepository) { }

    async createdCommentPostId(postId: string, userId: string, content: string): Promise<commentViewModel> {

        const createdAt = new Date().toISOString();
        const user = await this.usersQueryRepository.findUserById(new ObjectId(userId))
        const userLogin = user.accountData.login
        const creatComment = await this.commentsRepository.createdCommentPostId(postId, content, userId, userLogin, createdAt)
        return creatComment
    }

    async findCommentById(commentId: string, userId: string | null): Promise<commentViewModel | null> {

        const comment = await this.commentsQueryRepository.findCommentById(commentId, userId)
        if (comment === null) {
            return null
        }
        else {
            return comment
        }
    }
    async updateContent(userId: string, commentsId: string, content: string): Promise<Number> {
        try {
            const comment = await this.commentsQueryRepository.findCommentById(commentsId, userId)
            if (!comment) { return HttpStatus.NOT_FOUND }

            if (comment!.commentatorInfo.userId === userId) {
                const result = await this.commentsRepository.updateCommentId(commentsId, content)
                if (result === HttpStatus.NO_CONTENT) {
                    return HttpStatus.NO_CONTENT
                } else {
                    return HttpStatus.NOT_FOUND
                }
            }
            else {
                return HttpStatus.FORBIDDEN
            }
        } catch (e) { return HttpStatus.NOT_FOUND }
    }


    async deleteCommentById(commentsId: string, userId: string): Promise<HttpStatus.NO_CONTENT | HttpStatus.FORBIDDEN |  HttpStatus.NOT_FOUND> {

        try {
            const commentById = await this.commentsQueryRepository.findCommentById(commentsId, userId)
            if (!commentById) {
                return HttpStatus.NOT_FOUND
            }
            if (commentById.commentatorInfo.userId === userId) {
                const result = await this.commentsRepository.deletCommentById(commentsId)
                if (result === HttpStatus.NO_CONTENT) {
                    return HttpStatus.NO_CONTENT
                } else { 
                    return HttpStatus.NOT_FOUND
                }
            }
            else {
                return HttpStatus.FORBIDDEN
            }
        } catch (e) { return HttpStatus.NOT_FOUND }
    }

    async findCommentsByPostId(postId: string, userId: string | null, pagination: QueryPaginationType): Promise<paginatorComments | HttpStatus.NOT_FOUND> {
        return this.commentsQueryRepository.findCommentsByPostId(postId, userId, pagination)
    }

    async updateLikeStatus(commentId: string, userId: string, likeStatus: string): Promise<HttpStatus.NO_CONTENT | HttpStatus.NOT_FOUND> {
        return this.commentsRepository.updateLikeStatus(commentId, userId, likeStatus)
    }
}