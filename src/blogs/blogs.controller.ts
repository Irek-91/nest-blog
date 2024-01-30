import { FindPostsByBlogIdCommand } from './../posts/application/use-case/find.posts.by.blog.id.use.case';
import { FindBlogsCommand } from './application/use-case/find.blogs.use.case';
import { GetBlogIdCommand } from './application/use-case/get.blog.id.use.case';
import { CreateBlogCommand } from './application/use-case/create.blog.use.case';
import { CommandBus } from '@nestjs/cqrs';
import { postInputModelSpecific } from './../posts/model/post-model';
import { PostsService } from '../posts/application/posts.service';
import { Pagination } from './../helpers/query-filter';
import { Body, Controller, Get, Post, Put, Delete, Query, Param, HttpException, HttpStatus, UseGuards, Request } from "@nestjs/common";
import { BlogsService } from "./application/blogs.service";
import { log } from "console";
import { blogInput, blogOutput } from "./models/blogs-model";
import { BasicAuthGuard } from './../auth/guards/basic-auth.guard';
import { GetUserIdByAuth } from './../auth/guards/auth.guard';
import { UpdateBlogCommand } from './application/use-case/update.blog.use.case';
import { DeleteBlogIdCommand } from './application/use-case/delete.blog.id.use.case';
import { CreatedPostByBlogIdCommand } from './../posts/application/use-case/created.post.by.blog.id.use.case';


@Controller('blogs')
export class BlogsController {
    constructor(protected blogsService: BlogsService,
        protected postsService: PostsService,
        private readonly pagination: Pagination,
        private commandBus: CommandBus
    ) {
    }
    @UseGuards(GetUserIdByAuth)
    @Get()
    async getBlogs(@Query()
    query: {
        searchNameTerm?: string;
        sortBy?: string;
        sortDirection?: string;
        pageNumber?: string;
        pageSize?: string;
    }, @Request() req: any) {
        let userId = req.userId//исправить после авторизации
        if (!userId) {
            userId = null
        }
        const queryFilter = this.pagination.getPaginationFromQuery(query);
        return await this.commandBus.execute(new FindBlogsCommand(queryFilter, userId))
    }
    @Get(':id')
    async getBlogId(@Param('id') blogId: string) {
        const blog = await this.commandBus.execute(new GetBlogIdCommand(blogId))
        return blog
    }

    @UseGuards(GetUserIdByAuth)
    @Get(':blogId/posts')
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
        const foundPosts = await this.commandBus.execute(new FindPostsByBlogIdCommand(pagination, blogId, userId));

        if (!foundPosts) {
            throw new HttpException('Not Found', HttpStatus.NOT_FOUND)
        } else {
            return foundPosts
        }
    }

    @UseGuards(BasicAuthGuard)
    @Post()
    async createBlog(@Body() blogInputData: blogInput) {
        const blog = await this.commandBus.execute(new CreateBlogCommand(blogInputData, null))
        return blog
    }

    @UseGuards(BasicAuthGuard)
    @Post(':blogId/posts')
    async createPostByBlog(@Param('blogId') blogId: string,
        @Body() inputData: postInputModelSpecific) {
        const inputDataModel = {
            title: inputData.title,
            shortDescription: inputData.shortDescription,
            content: inputData.content,
            blogId: blogId,
        }

        const blog = await this.commandBus.execute(new GetBlogIdCommand(blogId))

        const newPost = await this.commandBus.execute(new CreatedPostByBlogIdCommand(inputDataModel));

        if (!newPost) {
            throw new HttpException('Not Found', HttpStatus.NOT_FOUND)
        } else {
            return newPost
        }
    }


    @UseGuards(BasicAuthGuard)
    @Put(':id')
    async updateBlog(@Param('id') blogId: string,
        @Body() blogInputData: blogInput) {
        const blog = await this.commandBus.execute(new GetBlogIdCommand(blogId))

        const blogUpdate = await this.commandBus.execute(new UpdateBlogCommand(blogId, blogInputData))

        if (blogUpdate === HttpStatus.NOT_FOUND) {
            throw new HttpException('Not Found', HttpStatus.NOT_FOUND);
        } else {
            throw new HttpException('No Content', HttpStatus.NO_CONTENT)
        }
    }

    @UseGuards(BasicAuthGuard)
    @Delete(':id')
    async deletBlog(@Param('id') blogId: string) {
        let result = await this.commandBus.execute(new DeleteBlogIdCommand(blogId))
        if (result === HttpStatus.NOT_FOUND) {
            throw new HttpException('Not Found', HttpStatus.NOT_FOUND);
        } else {
            throw new HttpException('No Content', HttpStatus.NO_CONTENT)
        }
    }

}