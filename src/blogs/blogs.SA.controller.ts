import { postInputModelSpecific } from '../posts/model/post-model';
import { PostsService } from '../posts/posts.service';
import { Pagination } from '../helpers/query-filter';
import { Body, Controller, Get, Post, Put, Delete, Query, Param, HttpException, HttpStatus, UseGuards, Request } from "@nestjs/common";
import { BlogsService } from "./blogs.service";
import { log } from "console";
import { blogInput, blogOutput } from "./models/blogs-model";
import { BasicAuthGuard } from '../auth/guards/basic-auth.guard';
import { GetUserIdByAuth } from '../auth/guards/auth.guard';

@UseGuards(BasicAuthGuard)
@Controller('sa/blogs')
export class BlogsSAController {
    constructor(protected blogsService: BlogsService,
        protected postsService: PostsService,
        private readonly pagination: Pagination
    ) {
    }
    
    @Get()
    async getBlogs(@Query()
    query: {
        searchNameTerm: string;
        sortBy: string;
        sortDirection: string;
        pageNumber: string;
        pageSize: string;
    }) {
        const queryFilter = this.pagination.getPaginationFromQuery(query);
        return await this.blogsService.findBlogs(queryFilter)
    }

    @Get(':id')
    async getBlogId(@Param('id') blogId: string) {
        const blog = await this.blogsService.getBlogId(blogId)
        return blog
    }

    @UseGuards(GetUserIdByAuth)
    @Get(':blogId/posts')
    async getPostsByBlogId(@Query()
    query: {
        searchNameTerm: string;
        sortBy: string;
        sortDirection: string;
        pageNumber: string;
        pageSize: string;
    },
    @Request() req: any,
        @Param('blogId') blogId: string) {
        let userId = req.userId//исправить после авторизации
        if (!userId) {
            userId = null
        }
        const pagination = this.pagination.getPaginationFromQuery(query)

        const blog = await this.blogsService.getBlogId(blogId)
        const foundPosts = await this.postsService.findPostsBlogId(pagination, blogId, userId);

        if (!foundPosts) {
            throw new HttpException('Not Found', HttpStatus.NOT_FOUND)
        } else {
            return foundPosts
        }
    }

    @Post()
    async createBlog(@Body() blogInputData: blogInput) {
        const blog = await this.blogsService.createBlog(blogInputData)
        return blog
    }

    @Post(':blogId/posts')
    async createPostByBlogId(@Param('blogId') blogId: string,
        @Body() inputData: postInputModelSpecific) {
        const inputDataModel = {
            title: inputData.title,
            shortDescription: inputData.shortDescription,
            content: inputData.content,
            blogId: blogId,
        }
        
        const blog = await this.blogsService.getBlogId(blogId)
        
        const newPost = await this.postsService.createdPostBlogId(inputDataModel);

        if (!newPost) {
            throw new HttpException('Not Found', HttpStatus.NOT_FOUND)
        } else {
            return newPost
        }
    }


    @Put(':id')
    async updateBlog(@Param('id') blogId: string,
        @Body() blogInputData: blogInput) {
        const blog = await this.blogsService.getBlogId(blogId)

        const blogUpdate = await this.blogsService.updateBlog(blogId, blogInputData)

        if (blogUpdate === HttpStatus.NOT_FOUND) {
            throw new HttpException('Not Found', HttpStatus.NOT_FOUND);
        } else {
            throw new HttpException('No Content', HttpStatus.NO_CONTENT)
        }
    }

    @Put(':blogId/posts/:postId')
    async updatePostByBlogId(@Param('blogId') blogId: string, @Param('postId') postId: string,
        @Body() postUpdateData: postInputModelSpecific) {
            const blog = await this.blogsService.getBlogId(blogId)
            const postResult = await this.postsService.updatePostId(postId, postUpdateData.title, 
                                                                    postUpdateData.shortDescription, 
                                                                    postUpdateData.content)
   
    }


    @Delete(':id')
    async deletBlog(@Param('id') blogId: string) {
        let result = await this.blogsService.deleteBlogId(blogId)
        if (result === HttpStatus.NOT_FOUND ) {
            throw new HttpException('Not Found', HttpStatus.NOT_FOUND);
        } else {
            throw new HttpException('No Content', HttpStatus.NO_CONTENT)
        }
    }

    @Delete(':blogId/posts/:postId')
    async deletPost(@Param('blogId') blogId: string, @Param('postId') postId: string) {
        const blog = await this.blogsService.getBlogId(blogId)
        const post = await this.postsService.deletePostId(postId);
        if (!post) {
            throw new HttpException('Not Found', HttpStatus.NOT_FOUND);
        } else {
            throw new HttpException('No content', HttpStatus.NO_CONTENT);
        }
    }
}