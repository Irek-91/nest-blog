import { Controller, Get, HttpException, HttpStatus, Param } from "@nestjs/common";
import { CommentsService } from "./comments.service";

@Controller('comments')
export class CommentsController {
    constructor(protected commentsService: CommentsService
    ) { }
    @Get(':id')
    async getCommentById(@Param('id') commentId: string) {
        const userId = null // после авторизации включить

        let comment = await this.commentsService.findCommentById(commentId, userId)
        if (comment === null) {
            throw new HttpException('Not Found', HttpStatus.NOT_FOUND);
        }

        else {
            return comment
        }
    }
}
