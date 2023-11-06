import { likeStatus } from './../likes/model/likes-model';
import { AuthGuard } from './../auth.guard';
import { commentInput } from './../comments/model/comments-model';
import { CommentsService } from './../comments/comments.service';
import { Pagination } from './../helpers/query-filter';
import { BlogsService } from './../blogs/blogs.service';
import { Controller, Get, Query, HttpException, HttpStatus, Param, Post, Body, Put, Delete, UseGuards, Request } from '@nestjs/common';
import { PostsService } from './posts.service';
import { paginatorPost, postInputModel, postOutput } from './model/post-model';
import { log } from 'console';
import { BasicAuthGuard } from './../auth/guards/basic-auth.guard';
import { JwtAuthGuard } from './../auth/guards/local-jwt.guard';
import { userAuthGuard } from './../auth/guards/auth.guard';


@Controller('posts')
export class PostsController {
    constructor(protected postsService: PostsService,
        private readonly pagination: Pagination,
        private readonly blogsService: BlogsService,
        private readonly commentsService: CommentsService,

    ) {
    }
    @UseGuards(userAuthGuard)
    @Get()
    async getPosts(@Query()
    query: {
        searchNameTerm?: string;
        sortBy?: string;
        sortDirection?: string;
        pageNumber?: string;
        pageSize?: string;
    },
        @Request() req: any
    ) {
        let userId = req.userId//исправить после авторизации
        if (!userId) {
            userId = null
        }
        const paginationPost = this.pagination.getPaginationFromQuery(query)
        const posts: paginatorPost = await this.postsService.findPost(paginationPost, userId);
        if (!posts) {
            throw new HttpException('Not Found', HttpStatus.NOT_FOUND);
        } else {
            return posts
        }
    }

    @UseGuards(userAuthGuard)
    @Get(':id')
    async getPostId(@Param('id') postId: string,
        @Request() req: any) {
        let userId = req.userId//исправить после авторизации
        if (!userId) {
            userId = null
        }
        let post: postOutput | number = await this.postsService.getPostId(postId, userId)
        return post
    }

    @UseGuards(userAuthGuard)
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
            }
        ) {
        let userId = req.userId//исправить после авторизации
        if (!userId) {
            userId = null
        }
        const pagination = this.pagination.getPaginationFromQuery(query)

        const resultPostId = await this.postsService.getPostId(postId, userId)
        const commentsPostId = await this.commentsService.findCommentsByPostId(postId, userId, pagination)
        return commentsPostId
    }

    @UseGuards(BasicAuthGuard)
    @Post()
    async createdPost(@Body() postInputData: postInputModel,
    ) {
        const blogId = await this.blogsService.getBlogId(postInputData.blogId)
        let post = await this.postsService.createdPostBlogId(postInputData)
        if (!post) {
            throw new HttpException('Not Found', HttpStatus.NOT_FOUND);
        } else {
            return post
        }
    }

    @UseGuards(userAuthGuard)
    @Post(':postId/comments')
    async createdCommentPostId(@Body() commentInputData: commentInput,
        @Request() req: any,
        @Param('postId') postId: string) {
            if (!req.userId) {
                throw new HttpException('UNAUTHORIZED', HttpStatus.UNAUTHORIZED)
            }
        const userId = req.userId
        const post = await this.postsService.getPostId(postId, userId)
        let comment = await this.commentsService.createdCommentPostId(postId, userId, commentInputData.content)
        return comment
    }

    @UseGuards(BasicAuthGuard)
    @Put(':id')
    async updatePostId(@Body() postInputData: postInputModel,
        @Param('id') postId: string) {
        let postResult = await this.postsService.updatePostId(postInputData, postId)
    }

    @UseGuards(userAuthGuard)
    @Put(':postId/like-status')
    async updateLikeStatusPostId(@Param('postId') postId: string,
        @Request() req: any,
        @Body() likeStatus: likeStatus) {
        if (!req.userId) {
            throw new HttpException('UNAUTHORIZED', HttpStatus.UNAUTHORIZED)
        }
        const userId = req.userId
        const resultUpdateLikeStatusPost = await this.postsService.updateLikeStatusPostId(postId, userId, likeStatus.likeStatus)
        if (resultUpdateLikeStatusPost) {
            throw new HttpException('No content', HttpStatus.NO_CONTENT);
        }
        else {
            throw new HttpException('Not Found', HttpStatus.NOT_FOUND);
        }
    }

    @UseGuards(BasicAuthGuard)
    @Delete(':id')
    async deletePost(
        @Param('id') postId: string
    ) {
        let post = await this.postsService.deletePostId(postId);
        if (!post) {
            throw new HttpException('Not Found', HttpStatus.NOT_FOUND);
        } else {
            throw new HttpException('No content', HttpStatus.NO_CONTENT);
        }
    }
}