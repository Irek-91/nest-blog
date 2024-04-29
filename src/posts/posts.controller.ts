import { FindCommentsByPostCommand } from '../comments/application/use-case/find.comments.by.post.use.case';
import { CreatedCommentPostCommand } from '../comments/application/use-case/created.comment.by.post.use.case';
import { CreatedPostByBlogIdCommand } from './application/use-case/created.post.by.blog.id.use.case';
import { DeletePostIdCommand } from './application/use-case/delete.post.id.use.case';
import { FindPostsCommand } from './application/use-case/find.post.use.case';
import {
  commentInput,
  paginatorComments,
} from '../comments/model/comments-model';
import { CommentsService } from '../comments/application/comments.service';
import { Pagination } from '../helpers/query-filter';
import { BlogsService } from '../blogs/application/blogs.service';
import {
  Controller,
  Get,
  Query,
  HttpException,
  HttpStatus,
  Param,
  Post,
  Body,
  Put,
  Delete,
  UseGuards,
  Request,
} from '@nestjs/common';
import { PostsService } from './application/posts.service';
import { paginatorPost, postInputModel, postOutput } from './model/post-model';
import { BasicAuthGuard } from '../auth/guards/basic-auth.guard';
import { GetUserIdByAuth, UserAuthGuard } from '../auth/guards/auth.guard';
import { CommandBus } from '@nestjs/cqrs';
import { GetPostIdCommand } from './application/use-case/get.post.id.use.case';
import { UpdatePostCommand } from './application/use-case/update.post.use.case';
import { UpdateLikeStatusPostCommand } from './application/use-case/update.like.status.post.use.case';
import { likeStatus } from '../likes/model/likes-model';
import { ApiTags } from '@nestjs/swagger';

@Controller('posts')
@ApiTags('Post')
export class PostsController {
  constructor(
    protected postsService: PostsService,
    private readonly pagination: Pagination,
    private readonly blogsService: BlogsService,
    private readonly commentsService: CommentsService,
    private commandBus: CommandBus,
  ) {}
  @UseGuards(GetUserIdByAuth)
  @Get()
  async getPosts(
    @Query()
    query: {
      searchNameTerm?: string;
      sortBy?: string;
      sortDirection?: string;
      pageNumber?: string;
      pageSize?: string;
    },
    @Request() req: any,
  ) {
    let userId = req.userId; //исправить после авторизации
    if (!userId) {
      userId = null;
    }
    const paginationPost = this.pagination.getPaginationFromQueryPosts(query);
    const posts: paginatorPost | null = await this.commandBus.execute(
      new FindPostsCommand(paginationPost, userId),
    );
    if (!posts) {
      throw new HttpException('Not Found', HttpStatus.NOT_FOUND);
    } else {
      return posts;
    }
  }

  @UseGuards(GetUserIdByAuth)
  @Get(':id')
  async getPostId(@Param('id') postId: string, @Request() req: any) {
    let userId = req.userId; //исправить после авторизации
    if (!userId) {
      userId = null;
    }
    const post: postOutput = await this.commandBus.execute(
      new GetPostIdCommand(postId, userId),
    );
    if (!post) {
      throw new HttpException('Not Found', HttpStatus.NOT_FOUND);
    }
    return post;
  }

  @UseGuards(GetUserIdByAuth)
  @Get(':postId/comments')
  async getCommentsBuPostId(
    @Param('postId') postId: string,
    @Request() req: any,
    @Query()
    query: {
      searchNameTerm?: string;
      sortBy?: string;
      sortDirection?: string;
      pageNumber?: string;
      pageSize?: string;
    },
  ) {
    let userId = req.userId; //исправить после авторизации
    if (!userId) {
      userId = null;
    }
    const pagination = this.pagination.getPaginationFromQueryPosts(query);

    const resultPostId = await this.commandBus.execute(
      new GetPostIdCommand(postId, userId),
    );
    if (!resultPostId) {
      throw new HttpException('Not Found', HttpStatus.NOT_FOUND);
    }
    const commentsPostId: paginatorComments | null =
      await this.commandBus.execute(
        new FindCommentsByPostCommand(postId, userId, pagination),
      );
    if (!commentsPostId) {
      throw new HttpException('Not Found', HttpStatus.NOT_FOUND);
    }
    return commentsPostId;
  }

  @UseGuards(BasicAuthGuard)
  @Post()
  async createdPost(@Body() postInputData: postInputModel) {
    const post = await this.commandBus.execute(
      new CreatedPostByBlogIdCommand(postInputData),
    );
    // if (!post) {
    //     throw new HttpException('Not Found', HttpStatus.NOT_FOUND);
    // } else {
    return post;
    // }
  }

  @UseGuards(UserAuthGuard)
  @Post(':postId/comments')
  async createdCommentPostId(
    @Body() commentInputData: commentInput,
    @Request() req: any,
    @Param('postId') postId: string,
  ) {
    const userId = req.userId;
    const post: postOutput | null = await this.commandBus.execute(
      new GetPostIdCommand(postId, userId),
    );

    if (!post) {
      throw new HttpException('Not Found', HttpStatus.NOT_FOUND);
    }
    const comment = await this.commandBus.execute(
      new CreatedCommentPostCommand(
        post.blogId,
        postId,
        userId,
        commentInputData.content,
      ),
    );
    if (!comment) {
      throw new HttpException('FORBIDDEN', HttpStatus.FORBIDDEN);
    }
    return comment;
  }

  @UseGuards(BasicAuthGuard)
  @Put(':id')
  async updatePostId(
    @Body() postInputData: postInputModel,
    @Param('id') postId: string,
  ) {
    const postResult = await this.commandBus.execute(
      new UpdatePostCommand(
        postId,
        postInputData.title,
        postInputData.shortDescription,
        postInputData.content,
      ),
    );
    if (postResult) {
      throw new HttpException('No content', HttpStatus.NO_CONTENT);
    } else {
      throw new HttpException('Not Found', HttpStatus.NOT_FOUND);
    }
  }

  @UseGuards(UserAuthGuard)
  @Put(':postId/like-status')
  async updateLikeStatusPostId(
    @Param('postId') postId: string,
    @Request() req: any,
    @Body() likeStatus: likeStatus,
  ) {
    const userId = req.userId;
    // const userBanned : User | null = await this.commandBus.execute(new GetUserByIdCommand(userId))
    // if (userBanned!.status === true) {
    //     throw new HttpException('Not Found', HttpStatus.NOT_FOUND);
    // }
    const resultUpdateLikeStatusPost = await this.commandBus.execute(
      new UpdateLikeStatusPostCommand(postId, userId, likeStatus.likeStatus),
    );
    if (resultUpdateLikeStatusPost) {
      throw new HttpException('No content', HttpStatus.NO_CONTENT);
    } else {
      throw new HttpException('Not Found', HttpStatus.NOT_FOUND);
    }
  }

  @UseGuards(BasicAuthGuard)
  @Delete(':id')
  async deletePost(@Param('id') postId: string) {
    const post = await this.commandBus.execute(new DeletePostIdCommand(postId));
    if (!post) {
      throw new HttpException('Not Found', HttpStatus.NOT_FOUND);
    } else {
      throw new HttpException('No content', HttpStatus.NO_CONTENT);
    }
  }
}
