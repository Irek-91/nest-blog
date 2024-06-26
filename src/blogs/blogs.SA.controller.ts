import { GetBlogDBCommand } from './application/use-case/get.blog.DB.use.case';
import { FindBlogsSACommand } from './application/use-case/find.blogs.SA.use.case copy';
import { BindBlogWithUserCommand } from './application/use-case/bind.blog.with.user.use.case';
import { UpdatePostCommand } from './../posts/application/use-case/update.post.use.case';
import { CreatedPostByBlogIdCommand } from './../posts/application/use-case/created.post.by.blog.id.use.case';
import { DeleteBlogIdCommand } from './application/use-case/delete.blog.id.use.case';
import { UpdateBlogCommand } from './application/use-case/update.blog.use.case';
import { CreateBlogCommand } from './application/use-case/create.blog.use.case';
import { postInputModelSpecific } from '../posts/model/post-model';
import { PostsService } from '../posts/application/posts.service';
import { Pagination } from '../helpers/query-filter';
import {
  Body,
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Query,
  Param,
  HttpException,
  HttpStatus,
  UseGuards,
  Request,
  HttpCode,
} from '@nestjs/common';
import { BlogsService } from './application/blogs.service';
import { banBlogInput, blogInput } from './models/blogs-model';
import { BasicAuthGuard } from '../auth/guards/basic-auth.guard';
import { GetUserIdByAuth } from '../auth/guards/auth.guard';
import { CommandBus } from '@nestjs/cqrs';
import { FindPostsByBlogIdCommand } from './../posts/application/use-case/find.posts.by.blog.id.use.case';
import { DeletePostIdCommand } from './../posts/application/use-case/delete.post.id.use.case';
import { UpdateBanStatusByBlogCommand } from './application/use-case/update.ban.status.by.blog.use.case';
import { GetSABlogIdCommand } from './application/use-case/get.SA.blog.id.use.';
import { ApiTags } from '@nestjs/swagger';

@UseGuards(BasicAuthGuard)
@Controller('sa/blogs')
@ApiTags('SA_Blog')
export class BlogsSAController {
  constructor(
    protected blogsService: BlogsService,
    protected postsService: PostsService,
    private readonly pagination: Pagination,
    private commandBus: CommandBus,
  ) {}

  @Get()
  async getBlogs(
    @Query()
    query: {
      searchNameTerm: string;
      sortBy: string;
      sortDirection: string;
      pageNumber: string;
      pageSize: string;
    },
  ) {
    const userId = null; //так как супер админ создает
    const queryFilter = this.pagination.getPaginationFromQuery(query);
    return await this.commandBus.execute(new FindBlogsSACommand(queryFilter));
  }

  @Get(':id')
  async getBlogId(@Param('id') blogId: string) {
    const blog = await this.commandBus.execute(new GetSABlogIdCommand(blogId));
    return blog;
  }

  @UseGuards(GetUserIdByAuth)
  @Get(':blogId/posts')
  async getPostsByBlogId(
    @Query()
    query: {
      searchNameTerm: string;
      sortBy: string;
      sortDirection: string;
      pageNumber: string;
      pageSize: string;
    },
    @Request() req: any,
    @Param('blogId') blogId: string,
  ) {
    let userId = req.userId; //исправить после авторизации
    if (!userId) {
      userId = null;
    }
    const pagination = this.pagination.getPaginationFromQuery(query);

    const blog = await this.commandBus.execute(new GetSABlogIdCommand(blogId));

    if (!blog) {
      throw new HttpException('Not Found', HttpStatus.NOT_FOUND);
    }
    const foundPosts = await this.commandBus.execute(
      new FindPostsByBlogIdCommand(pagination, blogId, userId),
    );

    if (!foundPosts) {
      throw new HttpException('Not Found', HttpStatus.NOT_FOUND);
    } else {
      return foundPosts;
    }
  }

  @Post()
  async createBlog(@Body() blogInputData: blogInput) {
    const blog = await this.commandBus.execute(
      new CreateBlogCommand(blogInputData, null),
    );
    return blog;
  }

  @Post(':blogId/posts')
  async createPostByBlogId(
    @Param('blogId') blogId: string,
    @Body() inputData: postInputModelSpecific,
  ) {
    const inputDataModel = {
      title: inputData.title,
      shortDescription: inputData.shortDescription,
      content: inputData.content,
      blogId: blogId,
    };

    const blog = await this.commandBus.execute(new GetSABlogIdCommand(blogId));
    if (!blog) {
      throw new HttpException('Not Found', HttpStatus.NOT_FOUND);
    }
    const newPost = await this.commandBus.execute(
      new CreatedPostByBlogIdCommand(inputDataModel),
    );

    if (!newPost) {
      throw new HttpException('Not Found', HttpStatus.NOT_FOUND);
    } else {
      return newPost;
    }
  }

  @HttpCode(HttpStatus.NO_CONTENT)
  @Put(':id')
  async updateBlog(
    @Param('id') blogId: string,
    @Body() blogInputData: blogInput,
  ) {
    const blog = await this.commandBus.execute(new GetSABlogIdCommand(blogId));
    if (!blog) {
      throw new HttpException('Not Found', HttpStatus.NOT_FOUND);
    }
    const blogUpdate = await this.commandBus.execute(
      new UpdateBlogCommand(blogId, blogInputData),
    );

    if (!blogUpdate) {
      throw new HttpException('Not Found', HttpStatus.NOT_FOUND);
    } else {
      throw new HttpException('No Content', HttpStatus.NO_CONTENT);
    }
  }

  @HttpCode(HttpStatus.NO_CONTENT)
  @Put(':id/bind-with-user/:userId')
  async bindBlogWithUser(
    @Param('id') blogId: string,
    @Param('userId') userId: string,
    @Body() postUpdateData: postInputModelSpecific,
  ) {
    const blog = await this.commandBus.execute(new GetSABlogIdCommand(blogId));
    if (!blog) {
      throw new HttpException('Not Found', HttpStatus.NOT_FOUND);
    }
    const result = await this.commandBus.execute(
      new BindBlogWithUserCommand(blogId, userId),
    );
  }

  @HttpCode(HttpStatus.NO_CONTENT)
  @Put(':id/ban')
  async banBlogById(
    @Param('id') blogId: string,
    @Body() banInput: banBlogInput,
  ) {
    const blog = await this.commandBus.execute(new GetSABlogIdCommand(blogId));
    if (!blog) {
      throw new HttpException('Not Found', HttpStatus.NOT_FOUND);
    }
    const res = await this.commandBus.execute(
      new UpdateBanStatusByBlogCommand(blogId, banInput.isBanned),
    );
  }

  @HttpCode(HttpStatus.NO_CONTENT)
  @Put(':blogId/posts/:postId')
  async updatePostByBlogId(
    @Param('blogId') blogId: string,
    @Param('postId') postId: string,
    @Body() postUpdateData: postInputModelSpecific,
  ) {
    const blog = await this.commandBus.execute(new GetSABlogIdCommand(blogId));
    if (!blog) {
      throw new HttpException('Not Found', HttpStatus.NOT_FOUND);
    }
    const postResult = await this.commandBus.execute(
      new UpdatePostCommand(
        postId,
        postUpdateData.title,
        postUpdateData.shortDescription,
        postUpdateData.content,
      ),
    );
    if (postResult) {
      throw new HttpException('No content', HttpStatus.NO_CONTENT);
    } else {
      throw new HttpException('Not Found', HttpStatus.NOT_FOUND);
    }
  }

  @Delete(':id')
  async deletBlog(@Param('id') blogId: string) {
    const result = await this.commandBus.execute(
      new DeleteBlogIdCommand(blogId),
    );
    if (result === HttpStatus.NOT_FOUND) {
      throw new HttpException('Not Found', HttpStatus.NOT_FOUND);
    } else {
      throw new HttpException('No Content', HttpStatus.NO_CONTENT);
    }
  }

  @Delete(':blogId/posts/:postId')
  async deletPost(
    @Param('blogId') blogId: string,
    @Param('postId') postId: string,
  ) {
    const blog = await this.commandBus.execute(new GetBlogDBCommand(blogId));
    const post = await this.commandBus.execute(new DeletePostIdCommand(postId));
    if (!post) {
      throw new HttpException('Not Found', HttpStatus.NOT_FOUND);
    } else {
      throw new HttpException('No content', HttpStatus.NO_CONTENT);
    }
  }
}
