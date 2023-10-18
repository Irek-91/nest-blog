import { Post, PostSchema } from './model/post-schema';
import {HttpStatus, Injectable } from "@nestjs/common"
import { PostRepository } from "./post.repo"
import { QueryPaginationType } from "src/helpers/query-filter"
import { paginatorPost, postInputModel, postMongoDb, postOutput } from "./model/post-model"
import { Filter, ObjectId } from "mongodb";
import { BlogsRepository } from 'src/blogs/blogs.repo';


@Injectable()

export class PostsService {

    constructor (protected postRepository: PostRepository, 
        protected blogRepository: BlogsRepository) { }
    async findPost(paginationQuery: QueryPaginationType, userId: string | null): Promise<paginatorPost> {
        return this.postRepository.findPost(paginationQuery, userId)
    }


    async findPostsBlogId(paginationQuery: QueryPaginationType, blogId: string, userId: string|null): Promise<paginatorPost | Number> {
        return this.postRepository.findPostsBlogId(paginationQuery, blogId, userId)
    }

    async getPostId(id: string, userId: string | null): Promise<postOutput | number> {
        return this.postRepository.getPostId(id, userId)
    }

    async deletePostId(id: string): Promise<Number> {
        return await this.postRepository.deletePostId(id)
    }

    async createdPostBlogId(postData : postInputModel): Promise<postOutput | Number> {
        
        const newPostId = new ObjectId()
        const createdAt = new Date().toISOString();
        let blodName = await this.blogRepository.getBlogNameById(postData.blogId)
        if (blodName === typeof Number) {
            return HttpStatus.NOT_FOUND
        }
        const newPost: postMongoDb = {
            _id: newPostId,
            title: postData.title,
            shortDescription: postData.shortDescription,
            content: postData.content,
            blogId: postData.blogId,
            blogName: blodName.toString(),
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

        if (result !== HttpStatus.CREATED) {return HttpStatus.NOT_FOUND}
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

    async updatePostId(postInputData: postInputModel, postId: string): Promise<Number> {
        //100
        const post = await this.postRepository.getPostById(postId)
        if(!post) {
            return HttpStatus.NOT_FOUND
        }

        post.title = postInputData.title
        post.shortDescription = postInputData.shortDescription
        post.content = postInputData.content
        //post.addLike()

        await this.postRepository.savePost(post)
        //0

        return HttpStatus.NO_CONTENT
        //return await this.postRepository.updatePostId(id, title, shortDescription, content, blogId)
    }

    async updateLikeStatusPostId(postId: string, userId: string, likeStatus: string): Promise<boolean | null> {
        return await this.postRepository.updateLikeStatusPostId(postId, userId, likeStatus)
    }
    async deletePostAll(): Promise<boolean> {
        return await this.postRepository.deletePostAll()
    }
}