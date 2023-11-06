import { likeStatus } from './../likes/model/likes-model';
import { Controller, Delete, Get, Put, HttpException, HttpStatus, Param, Body, UseGuards, Request } from "@nestjs/common";
import { CommentsService } from "./comments.service";
import { commentInput } from "./model/comments-model";
import { JwtAuthGuard } from './../auth/guards/local-jwt.guard';
import { GetUserIdByAuth, UserAuthGuard } from './../auth/guards/auth.guard';


@Controller('comments')
export class CommentsController {
    constructor(protected commentsService: CommentsService
    ) { }

    @UseGuards(GetUserIdByAuth)
    @Get(':commentId')
    async getCommentById(
        @Param('commentId') commentId: string,
        @Request() req: any
        ) {
        let userId = req.userId//исправить после авторизации
        if (!userId) {
            userId = null
        }
        let comment = await this.commentsService.findCommentById(commentId, userId)
        if (!comment) {
            throw new HttpException('Not Found', HttpStatus.NOT_FOUND);
        }
        else {
            return comment
        }
    }

    @UseGuards(UserAuthGuard)
    @Put(':commentId')
    async updateCommentId(@Param('commentId') commentId: string,
        @Body() commentInputData: commentInput,
        @Request() req: any
        ) {
        const userId = req.userId
        let resultContent = await this.commentsService.updateContent(userId, commentId, commentInputData.content)
        if (resultContent === 403) {
            throw new HttpException('If try edit the comment that is not your own', HttpStatus.FORBIDDEN)
        }
        if (resultContent === 204) {
            throw new HttpException('No Content', HttpStatus.NO_CONTENT)
        }
        if (resultContent === 404) {
            throw new HttpException('Not Found', HttpStatus.NOT_FOUND)
        }
    }

    @UseGuards(UserAuthGuard)
    @Put(':commentId/like-status')
    async updateStatusByCommentId(@Param('commentId') commentId: string,
    @Body() likeStatus: likeStatus,
    @Request() req: any
    ) {
        const userId = req.userId
        const result = await this.commentsService.updateLikeStatus(commentId, userId, likeStatus.likeStatus)
        if (result === 204) {
            throw new HttpException('No Content', HttpStatus.NO_CONTENT)
        }
        if (result === 404) {
            throw new HttpException('Not Found', HttpStatus.NOT_FOUND)
        }
    }


    @UseGuards(UserAuthGuard)
    @Delete(':commentId')
    async deleteCommentById(@Param('commentId') commentId: string,
    @Request() req: any
    ) {
        
        const userId = req.userId
        const result = await this.commentsService.deleteCommentById(commentId, userId)
        if (result === 403) {
            throw new HttpException('If try edit the comment that is not your own', HttpStatus.FORBIDDEN)
        }
        if (result === 204) {
            throw new HttpException('No Content', HttpStatus.NO_CONTENT)
        }
        if (result === 404) {
            throw new HttpException('Not Found', HttpStatus.NOT_FOUND)
        }
    }

}
