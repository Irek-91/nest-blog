import { likeStatus } from './../likes/model/likes-model';
import { AuthGuard } from './../auth.guard';
import { commentInput } from './../comments/model/comments-model';
import { CommentsService } from './../comments/comments.service';
import { Pagination } from './../helpers/query-filter';
import { BlogsService } from './../blogs/blogs.service';
import { Controller, Get, Query, HttpException, HttpStatus, Param, Post, Body, Put, Delete, UseGuards } from '@nestjs/common';
import { PostsService } from './posts.service';
import { paginatorPost, postInputModel, postOutput } from './model/post-model';
import { log } from 'console';
import { LocalAuthGuard } from './../auth/guards/local-auth.guard';


@Controller('posts')
export class PostsController {
    constructor(protected postsService: PostsService,
        private readonly pagination: Pagination,
        private readonly blogsService: BlogsService,
        private readonly commentsService: CommentsService,

    ) {
    }
    @Get()
    async getPosts(@Query()
    query: {
        searchNameTerm?: string;
        sortBy?: string;
        sortDirection?: string;
        pageNumber?: string;
        pageSize?: string;
    }) {
        const userId = null //поменять когда будет авторизация

        const paginationPost = this.pagination.getPaginationFromQuery(query)
        const posts: paginatorPost = await this.postsService.findPost(paginationPost, userId);
        if (!posts) {
            throw new HttpException('Not Found', HttpStatus.NOT_FOUND);
        } else {
            return posts
        }
    }
    @Get(':id')
    async getPostId(@Param('id') postId: string) {
        const userId = null //поменять когда будет авторизация
        let post: postOutput | number = await this.postsService.getPostId(postId, userId)
        return post
    }
    @Get(':postId/comments')
    async getCommentsBuPostId(@Param('postId') postId: string,
        @Query()
        query: {
            searchNameTerm?: string;
            sortBy?: string;
            sortDirection?: string;
            pageNumber?: string;
            pageSize?: string;
        }) {
        const userId = null //поменять когда будет авторизация
        const pagination = this.pagination.getPaginationFromQuery(query)

        const resultPostId = await this.postsService.getPostId(postId, userId)
        const commentsPostId = await this.commentsService.findCommentsByPostId(postId, userId, pagination)
        return commentsPostId
    }

    @UseGuards(LocalAuthGuard)
    @Post()
    async createdPost(@Body() postInputData: postInputModel) {
        const blogId = await this.blogsService.getBlogId(postInputData.blogId)
        let post = await this.postsService.createdPostBlogId(postInputData)
        if (post === HttpStatus.NOT_FOUND) {
            throw new HttpException('Not Found', HttpStatus.NOT_FOUND);
        } else {
            return post
        }
    }


    @UseGuards(AuthGuard)
    @Post(':postId/comments')
    async createdCommentPostId(@Body() commentInputData: commentInput,
        @Param('postId') postId: string) {
        //const userId = req.user._id.toString()
        const userId = "null"
        const post = await this.postsService.getPostId(postId, userId)
        let comment = await this.commentsService.createdCommentPostId(postId, userId, commentInputData.content)
        return comment
    }

    @UseGuards(LocalAuthGuard)
    @Put(':id')
    async updatePostId(@Body() postInputData: postInputModel,
        @Param('id') postId: string) {
        let postResult = await this.postsService.updatePostId(postInputData, postId)
    }

    
    @Put(':postId/like-status')
    async updateLikeStatusPostId(@Param('postId') postId: string,
        @Body() likeStatus: likeStatus) {
        // if (!req.user) { return res.sendStatus(404) }
        // const postId = req.params.postId;
        // const userId = req.user!._id.toString()
        // const likeStatus = req.body.likeStatus
        const userId = 'sdvsvd'
        const resultUpdateLikeStatusPost = await this.postsService.updateLikeStatusPostId(postId, userId, likeStatus.likeStatus)
        if (resultUpdateLikeStatusPost) {
            throw new HttpException('No content', HttpStatus.NO_CONTENT);
        }
        else {
            throw new HttpException('Not Found', HttpStatus.NOT_FOUND);
        }
    }

    @UseGuards(LocalAuthGuard)
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