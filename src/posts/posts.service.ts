import { BlogsQueryRepository } from '../blogs/db-mongo/blogs.query.repo';
import { BlogsRepository } from '../blogs/db-mongo/blogs.repo';
import { QueryPaginationType } from './../helpers/query-filter';
import { Post, PostSchema } from './model/post-schema';
import {HttpStatus, Injectable , HttpException} from "@nestjs/common"
import { paginatorPost, postInputModel, postMongoDb, postOutput } from "./model/post-model"
import { Filter, ObjectId } from "mongodb";
import { PostQueryRepository } from './db-mongo/post.query.repo';
import { PostRepository } from './db-mongo/post.repo';
import { PostQueryRepoPSQL } from './db-psql/post.query.repo';
import { BlogsQueryRepoPSQL } from '../blogs/db-psql/blogs.query.repo.PSQL';
import { PostRepoPSQL } from './db-psql/post.repo';
import { log } from 'node:console';
import { v4 as uuidv4 } from 'uuid';


@Injectable()

export class PostsService {

    constructor (protected postRepository: PostRepoPSQL,
        protected postQueryRepo: PostQueryRepoPSQL,
        protected blogQueryRepository: BlogsQueryRepoPSQL) { }
        
    async findPost(paginationQuery: QueryPaginationType, userId: string | null): Promise<paginatorPost> {
        return this.postQueryRepo.findPost(paginationQuery, userId)
    }


    async findPostsBlogId(paginationQuery: QueryPaginationType, blogId: string, userId: string|null): Promise<paginatorPost | null> {
        return this.postQueryRepo.findPostsBlogId(paginationQuery, blogId, userId)
    }

    async getPostId(id: string, userId: string | null): Promise<postOutput> {
        return this.postQueryRepo.getPostId(id, userId)
    }

    async deletePostId(id: string): Promise<Boolean | null> {
        const result = await this.postRepository.deletePostId(id)
        if (!result) {
            throw new HttpException('Not Found', HttpStatus.NOT_FOUND)
        } else {
            return true
        }

    }

    async deletePostsByBlogId(blogId: string): Promise<Boolean | null> {
        const result = await this.postRepository.deletePostsByBlogId(blogId)
        // if (!result) {
        //     throw new HttpException('Not Found', HttpStatus.NOT_FOUND)
        // } else {
        //     return true
        // }
        return true
    }

    async createdPostBlogId(postData : postInputModel): Promise<postOutput | null> {
        
        const newPostId = uuidv4()
        const createdAt = new Date().toISOString();
        let blogName = await this.blogQueryRepository.getBlogNameById(postData.blogId)
        if (!blogName) {
            return null
        }
        const newPost: postMongoDb = {
            _id: newPostId,
            title: postData.title,
            shortDescription: postData.shortDescription,
            content: postData.content,
            blogId: postData.blogId,
            blogName: blogName.toString(),
            createdAt: createdAt,
            extendedLikesInfo: {
                likesCount: 0,
                dislikesCount: 0,
                myStatus: 'None',
                newestLikes: [
                ]
            }
        }
        const result = await this.postRepository.createdPost(newPost)

        if (!result) {return null}
        return {
            id: newPost._id.toString(),
            title: newPost.title,
            shortDescription: newPost.shortDescription,
            content: newPost.content,
            blogId: newPost.blogId,
            blogName: newPost.blogName,
            createdAt: newPost.createdAt,
            extendedLikesInfo: {
                likesCount: 0,
                dislikesCount: 0,
                myStatus: 'None',
                newestLikes: []
            }
        }
    }

    async updatePostId( postId: string, title:string,  shortDescription: string, content: string): Promise<Number> {
        //100
        const post = await this.postQueryRepo.getPostById(postId)
        if(!post) {
            throw new HttpException('Not Found', HttpStatus.NOT_FOUND)
        }

        // post.title = postInputData.title
        // post.shortDescription = postInputData.shortDescription
        // post.content = postInputData.content
        // post.addLike()
        // await this.postRepository.savePost(post)
        const result=  await this.postRepository.updatePostId(postId, title, shortDescription, content)
        if (result) {
        throw new HttpException('No content', HttpStatus.NO_CONTENT)
        } else {
            throw new HttpException('Not Found', HttpStatus.NOT_FOUND)
        }
    }

    async updateLikeStatusPostId(postId: string, userId: string, likeStatus: string): Promise<boolean | null> {
        const result = await this.postQueryRepo.getPostById(postId)
        if (!result) {return null}
        return await this.postRepository.updateLikeStatusPostId(postId, userId, likeStatus)
    }
    async deletePostAll(): Promise<boolean> {
        return await this.postRepository.deletePostAll()
    }
}