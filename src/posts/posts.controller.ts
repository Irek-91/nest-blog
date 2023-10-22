import { BlogsService } from './../blogs/blogs.service';
import { Controller, Get, Query, HttpException, HttpStatus, Param, Post, Body, Put, Delete, UseGuards } from '@nestjs/common';
import { PostsService } from './posts.service';
import { Pagination } from 'src/helpers/query-filter';
import { paginatorPost, postInputModel, postOutput } from './model/post-model';
import { CommentsService } from 'src/comments/comments.service';
import { log } from 'console';
import { commentInput } from 'src/comments/model/comments-model';
import { AuthGuard } from 'src/auth.guard';
import { likeStatus } from 'src/likes/model/likes-model';

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
        if (post === HttpStatus.NOT_FOUND) {
            throw new HttpException('Not Found', HttpStatus.NOT_FOUND);
        } else {
            return post
        }
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
        if (resultPostId === HttpStatus.NOT_FOUND) {
            throw new HttpException('Not Found', HttpStatus.NOT_FOUND);
        }
        else {
            const commentsPostId = await this.commentsService.findCommentsByPostId(postId, userId, pagination)
            if (commentsPostId !== null) {
                return commentsPostId
            }
            else {
                throw new HttpException('Not Found', HttpStatus.NOT_FOUND);
            }
        }
    }
    @Post()
    async createdPost(@Body() postInputData: postInputModel) {
        const blogId = await this.blogsService.getBlogId(postInputData.blogId)
        if (!blogId) {
            throw new HttpException('Not Found', HttpStatus.NOT_FOUND);
        }
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
        log(post)
        if (post === HttpStatus.NOT_FOUND) {
            throw new HttpException('Not Found', HttpStatus.NOT_FOUND)
        }

        let comment = await this.commentsService.createdCommentPostId(postId, userId, commentInputData.content)
        if (comment === HttpStatus.NOT_FOUND) {
            throw new HttpException('Not Found', HttpStatus.NOT_FOUND)
        }
        else {
            return comment
        }
    }

    @Put(':id')
    async updatePostId(@Body() postInputData: postInputModel,
        @Param('id') postId: string) {
        let postResult = await this.postsService.updatePostId(postInputData, postId)
        if (postResult === HttpStatus.NOT_FOUND) {
            throw new HttpException('Not Found', HttpStatus.NOT_FOUND);
        } else {
            throw new HttpException('Not Found', HttpStatus.NO_CONTENT);
        }
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
            throw new HttpException('Not Found', HttpStatus.NO_CONTENT);
        }
        else {
            throw new HttpException('Not Found', HttpStatus.NOT_FOUND);
        }
    }

    @Delete(':id')
    async deletePost(
        @Param('id') postId: string
    ) {
        let post = await this.postsService.deletePostId(postId);
        if (post === HttpStatus.NO_CONTENT) {
            throw new HttpException('Not Found', HttpStatus.NO_CONTENT);
        } else {
            throw new HttpException('Not Found', HttpStatus.NOT_FOUND);
        }
    }
}