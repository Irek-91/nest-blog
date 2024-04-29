import { DeleteCommentByIdCommand } from './application/use-case/delete.comment.by.id.use.case';
import { GetCommentByIdCommand } from './application/use-case/get.comment.by.id.use.case';
import { likeStatus } from './../likes/model/likes-model';
import {
  Controller,
  Delete,
  Get,
  Put,
  HttpException,
  HttpStatus,
  Param,
  Body,
  UseGuards,
  Request,
} from '@nestjs/common';
import { CommentsService } from './application/comments.service';
import { commentInput } from './model/comments-model';
import { GetUserIdByAuth, UserAuthGuard } from './../auth/guards/auth.guard';
import { CommandBus } from '@nestjs/cqrs';
import { UpdateCommentByPostCommand } from './application/use-case/update.comment.py.post.use.case';
import { UpdateLikeStatusCommentCommand } from './application/use-case/update.like.status.commet.use.case';
import { ApiTags } from '@nestjs/swagger';

@Controller('comments')
@ApiTags('Comment')
export class CommentsController {
  constructor(
    protected commentsService: CommentsService,
    private commandBus: CommandBus,
  ) {}

  @UseGuards(GetUserIdByAuth)
  @Get(':commentId')
  async getCommentById(
    @Param('commentId') commentId: string,
    @Request() req: any,
  ) {
    let userId = req.userId; //исправить после авторизации
    if (!userId) {
      userId = null;
    }
    const comment = await this.commandBus.execute(
      new GetCommentByIdCommand(commentId, userId),
    );
    if (!comment) {
      throw new HttpException('Not Found', HttpStatus.NOT_FOUND);
    } else {
      return comment;
    }
  }

  @UseGuards(UserAuthGuard)
  @Put(':commentId')
  async updateCommentId(
    @Param('commentId') commentId: string,
    @Body() commentInputData: commentInput,
    @Request() req: any,
  ) {
    const userId = req.userId;
    const resultContent = await this.commandBus.execute(
      new UpdateCommentByPostCommand(
        userId,
        commentId,
        commentInputData.content,
      ),
    );
    if (resultContent === false) {
      throw new HttpException(
        'If try edit the comment that is not your own',
        HttpStatus.FORBIDDEN,
      );
    }
    if (resultContent === true) {
      throw new HttpException('No Content', HttpStatus.NO_CONTENT);
    }
    if (resultContent === null) {
      throw new HttpException('Not Found', HttpStatus.NOT_FOUND);
    }
  }

  @UseGuards(UserAuthGuard)
  @Put(':commentId/like-status')
  async updateStatusByCommentId(
    @Param('commentId') commentId: string,
    @Body() likeStatus: likeStatus,
    @Request() req: any,
  ) {
    const userId = req.userId;
    const result = await this.commandBus.execute(
      new UpdateLikeStatusCommentCommand(
        commentId,
        userId,
        likeStatus.likeStatus,
      ),
    );
    if (result === true) {
      throw new HttpException('No Content', HttpStatus.NO_CONTENT);
    }
    if (result === null) {
      throw new HttpException('Not Found', HttpStatus.NOT_FOUND);
    }
  }

  @UseGuards(UserAuthGuard)
  @Delete(':commentId')
  async deleteCommentById(
    @Param('commentId') commentId: string,
    @Request() req: any,
  ) {
    const userId = req.userId;
    const result = await this.commandBus.execute(
      new DeleteCommentByIdCommand(commentId, userId),
    );
    if (result === false) {
      throw new HttpException(
        'If try edit the comment that is not your own',
        HttpStatus.FORBIDDEN,
      );
    }
    if (result === true) {
      throw new HttpException('No Content', HttpStatus.NO_CONTENT);
    }
    if (result === null) {
      throw new HttpException('Not Found', HttpStatus.NOT_FOUND);
    }
  }
}
