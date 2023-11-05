import { likeStatus } from './../likes/model/likes-model';
import { Controller, Delete, Get, Put, HttpException, HttpStatus, Param, Body } from "@nestjs/common";
import { CommentsService } from "./comments.service";
import { commentInput } from "./model/comments-model";

@Controller('comments')
export class CommentsController {
    constructor(protected commentsService: CommentsService
    ) { }
    @Get(':commentId')
    async getCommentById(@Param('commentId') commentId: string) {
        const userId = null // после авторизации включить

        let comment = await this.commentsService.findCommentById(commentId, userId)
        if (comment === null) {
            throw new HttpException('Not Found', HttpStatus.NOT_FOUND);
        }

        else {
            return comment
        }
    }
    
    @Put(':commentId')
    async updateCommentId(@Param('commentId') commentId: string,
        @Body() commentInputData: commentInput) {
        // if (!req.user) { return res.sendStatus(401) }

        // const commentsId = req.params.commentsId
        // const userId = req.user._id.toString()
        // const content = req.body.content
        const userId = 'vdsv'
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


    @Put(':commentId/like-status')
    async updateStatusByCommentId(@Param('commentId') commentId: string,
    @Body() likeStatus: likeStatus) {
        // if (!req.user) { return res.sendStatus(401) }
        // const commentId = req.params.commentsId
        // const userId = req.user._id.toString()
        // const likeStatus = req.body.likeStatus
        const userId = 'sdasvd'
        const result = await this.commentsService.updateLikeStatus(commentId, userId, likeStatus.likeStatus)
        if (result === 204) {
            throw new HttpException('No Content', HttpStatus.NO_CONTENT)
        }
        if (result === 404) {
            throw new HttpException('Not Found', HttpStatus.NOT_FOUND)
        }
    }



    @Delete(':commentId')
    async deleteCommentById(@Param('commentId') commentId: string) {
        // if (!req.user) { return res.sendStatus(401) }

        // const commentsId = req.params.commentsId
        // const userId = req.user._id.toString() 
        const userId = 'sds'
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
