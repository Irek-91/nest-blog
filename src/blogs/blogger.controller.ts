import { paginationGetCommentsByBlog } from './../comments/model/comments-model';
import { GetCommentsByBlogCommand } from './../comments/application/use-case/get.comments.by.blog.use.cae';
import { BanUserByBloggerCommand } from './../users/application/use-case/ban.user.by.blogger.use.case';
import { BanUserByBloggerInputModel } from './../users/models/users-model';
import { CustomPipe } from './../adapters/pipe';
import { UpdatePostCommand } from './../posts/application/use-case/update.post.use.case';
import { FindPostsByBlogIdCommand } from './../posts/application/use-case/find.posts.by.blog.id.use.case';
import { CreatedPostByBlogIdCommand } from './../posts/application/use-case/created.post.by.blog.id.use.case';
import { postInputModelSpecific } from './../posts/model/post-model';
import { UpdateBlogCommand } from './application/use-case/update.blog.use.case';
import { GetBlogDBCommand } from './application/use-case/get.blog.DB.use.case';
import { GetBlogIdCommand } from './application/use-case/get.blog.id.use.case';
import { DeleteBlogIdCommand } from './application/use-case/delete.blog.id.use.case';
import { FindBlogsCommand } from './application/use-case/find.blogs.use.case';
import { blogInput, paginatorBlog } from './models/blogs-model';
import { CreateBlogCommand } from './application/use-case/create.blog.use.case';
import { UserAuthGuard } from './../auth/guards/auth.guard';
import { CommandBus } from '@nestjs/cqrs';
import { Pagination } from './../helpers/query-filter';
import { PostsService } from './../posts/application/posts.service';
import { BlogsService } from './application/blogs.service';
import { Body, Controller, Delete, Get, HttpCode, HttpException, HttpStatus, Param, Post, Put, Query, Request, UseGuards } from "@nestjs/common";
import { paginatorPost, postInputModel, postOutput } from '../posts/model/post-model';
import { DeletePostIdCommand } from './../posts/application/use-case/delete.post.id.use.case';
import { Blog } from './db-psql/entity/blog.entity';


@UseGuards(UserAuthGuard)
@Controller('blogger')
export class BloggerController {
    constructor(protected blogsService: BlogsService,
        protected postsService: PostsService,
        private readonly pagination: Pagination,
        private commandBus: CommandBus
    ) {
    }


    @Get('blogs')
    async getBlogs(@Query()
    query: {
        searchNameTerm?: string;
        sortBy?: string;
        sortDirection?: string;
        pageNumber?: string;
        pageSize?: string;
    }, @Request() req: any) {
        const userId = req.userId//исправить после авторизации

        const queryFilter = this.pagination.getPaginationFromQuery(query);
        const blogs: paginatorBlog = await this.commandBus.execute(new FindBlogsCommand(queryFilter, userId))
        if (!blogs) {
            throw new HttpException('Not Found', HttpStatus.NOT_FOUND)
        } else {
            return blogs
        }
    }

    @Get('blogs/comments')
    async getCommentsPostsByBlog(@Query()
    query: {
        sortBy?: string;
        sortDirection?: string;
        pageNumber?: string;
        pageSize?: string;
    }, @Request() req: any) {
        const userId = req.userId

        const queryFilter = this.pagination.getPaginationFromQuery(query);
        const comments: paginationGetCommentsByBlog | null = await this.commandBus.execute(new GetCommentsByBlogCommand(userId, queryFilter))

        if (!comments) {
            throw new HttpException('Not Found', HttpStatus.NOT_FOUND)
        } else {
            return comments
        }
    }





    @Get('blogs/:blogId/posts')
    async getPostsByBlogId(@Query()
    query: {
        searchNameTerm?: string;
        sortBy?: string;
        sortDirection?: string;
        pageNumber?: string;
        pageSize?: string;
    },
        @Request() req: any,
        @Param('blogId') blogId: string) {
        let userId = req.userId//исправить после авторизации
        if (!userId) {
            userId = null
        }
        const pagination = this.pagination.getPaginationFromQuery(query)
        const blog = await this.commandBus.execute(new GetBlogIdCommand(blogId))
        if (!blog) {
            throw new HttpException('Not Found', HttpStatus.NOT_FOUND)
        }

        const foundPosts = await this.commandBus.execute(new FindPostsByBlogIdCommand(pagination, blogId, userId));
        if (!foundPosts) {
            throw new HttpException('Not Found', HttpStatus.NOT_FOUND)
        } else {
            return foundPosts
        }
    }



    @Post('blogs')
    async createBlogByBlogger(@Body() blogInputData: blogInput,
        @Request() req: any) {
        const userId = req.userId//исправить после авторизации
        const blog = await this.commandBus.execute(new CreateBlogCommand(blogInputData, userId))
        return blog
    }


    @Post('blogs/:blogId/posts')
    async createPostByBlog(@Param('blogId', new CustomPipe()) blogId: string,
        @Body() inputData: postInputModelSpecific,
        @Request() req: any) {
        const userId = req.userId//исправить после авторизации
        const inputDataModel = {
            title: inputData.title,
            shortDescription: inputData.shortDescription,
            content: inputData.content,
            blogId: blogId,
        }
        const blog: Blog | null = await this.commandBus.execute(new GetBlogDBCommand(blogId))
        if (!blog) {
            throw new HttpException('Not Found', HttpStatus.NOT_FOUND)
        }
        if (blog.blogger._id !== userId) {
            throw new HttpException('Forbidden', HttpStatus.FORBIDDEN);
        }
        const newPost = await this.commandBus.execute(new CreatedPostByBlogIdCommand(inputDataModel));

        if (!newPost) {
            throw new HttpException('Not Found', HttpStatus.NOT_FOUND)
        } else {
            return newPost
        }
    }


    @Put('blogs/:id')
    async updateBlog(@Param('id') blogId: string,
        @Body() blogInputData: blogInput,
        @Request() req: any) {
        const userId = req.userId//исправить после авторизации
        const blog: Blog | null = await this.commandBus.execute(new GetBlogDBCommand(blogId))
        if (!blog) {
            throw new HttpException('Not Found', HttpStatus.NOT_FOUND);
        }
        if (blog.blogger._id !== userId) {
            throw new HttpException('Forbidden', HttpStatus.FORBIDDEN);
        }

        const blogUpdate = await this.commandBus.execute(new UpdateBlogCommand(blogId, blogInputData))

        if (blogUpdate === HttpStatus.NOT_FOUND) {
            throw new HttpException('Not Found', HttpStatus.NOT_FOUND);
        } else {
            throw new HttpException('No Content', HttpStatus.NO_CONTENT)
        }
    }




    @Put('blogs/:blogId/posts/:postId')
    async updatePostByBlogId(@Param('blogId') blogId: string, @Param('postId') postId: string,
        @Body() postUpdateData: postInputModelSpecific,
        @Request() req: any) {
        const userId = req.userId//исправить после авторизации

        const blog: Blog | null = await this.commandBus.execute(new GetBlogDBCommand(blogId))
        if (!blog) {
            throw new HttpException('Not Found', HttpStatus.NOT_FOUND)
        }
        if (blog.blogger._id !== userId) {
            throw new HttpException('Forbidden', HttpStatus.FORBIDDEN);
        }
        const postResult = await this.commandBus.execute(new UpdatePostCommand(postId, postUpdateData.title,
            postUpdateData.shortDescription,
            postUpdateData.content))
        if (postResult) {
            throw new HttpException('No content', HttpStatus.NO_CONTENT)
        } else {
            throw new HttpException('Not Found', HttpStatus.NOT_FOUND)
        }

    }

    @Delete('blogs/:blogId/posts/:postId')
    async deletePostByBlogId(@Param('blogId') blogId: string, @Param('postId') postId: string,
        @Request() req: any) {
        let userId = req.userId//исправить после авторизации
        const blog: Blog | null = await this.commandBus.execute(new GetBlogDBCommand(blogId))
        if (!blog) {
            throw new HttpException('Not Found', HttpStatus.NOT_FOUND);
        }
        if (blog.blogger._id !== userId) {
            throw new HttpException('Forbidden', HttpStatus.FORBIDDEN);
        }
        let result = await this.commandBus.execute(new DeletePostIdCommand(postId))

        if (!result) {
            throw new HttpException('Not Found', HttpStatus.NOT_FOUND);
        } else {
            throw new HttpException('No Content', HttpStatus.NO_CONTENT)
        }
    }


    @Delete('blogs/:id')
    async deletBlog(@Param('id') blogId: string,
        @Request() req: any) {
        let userId = req.userId//исправить после авторизации
        const blog: Blog | null = await this.commandBus.execute(new GetBlogDBCommand(blogId))
        if (!blog) {
            throw new HttpException('Not Found', HttpStatus.NOT_FOUND);
        }
        if (blog.blogger._id !== userId) {
            throw new HttpException('Forbidden', HttpStatus.FORBIDDEN);
        }
        let result = await this.commandBus.execute(new DeleteBlogIdCommand(blogId))

        if (!result) {
            throw new HttpException('Not Found', HttpStatus.NOT_FOUND);
        } else {
            throw new HttpException('No Content', HttpStatus.NO_CONTENT)
        }
    }



}
