import { Controller, Get, Query, HttpException, HttpStatus, Param } from '@nestjs/common';
import { PostsService } from './posts.service';
import { Pagination } from 'src/helpers/query-filter';
import { paginatorPost, postOutput } from './model/post-model';

@Controller('posts')
export class BlogsController {
    constructor(protected postsService: PostsService,
        private readonly pagination : Pagination
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
        const userId= null //поменять когда будет авторизация

        const paginationPost = this.pagination.getPaginationFromQuery(query)
        const posts: paginatorPost = await this.postsService.findPost(paginationPost, userId);
        if (!posts) {
            throw new HttpException('Not Found', HttpStatus.NOT_FOUND);
        } else {
            return posts
        }
    }
    @Get(':id')
    async getPostId(@Param('id') postId : string) {
        const userId= null //поменять когда будет авторизация

        let post: postOutput | number = await this.postsService.getPostId(postId, userId)
        if (!post) {
            throw new HttpException('Not Found', HttpStatus.NOT_FOUND);
        } else {
            return post
        }
    }



}