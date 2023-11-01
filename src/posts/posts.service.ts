import { BlogsQueryRepository } from './../blogs/blogs.query.repo';
import { BlogsRepository } from './../blogs/blogs.repo';
import { QueryPaginationType } from './../helpers/query-filter';
import { Post, PostSchema } from './model/post-schema';
import {HttpStatus, Injectable , HttpException} from "@nestjs/common"
import { PostRepository } from "./post.repo"
import { paginatorPost, postInputModel, postMongoDb, postOutput } from "./model/post-model"
import { Filter, ObjectId } from "mongodb";
import { PostQueryRepository } from './post.query.repo';


@Injectable()

export class PostsService {

    constructor (protected postRepository: PostRepository,
        protected postQueryRepo: PostQueryRepository,
        protected blogQueryRepository: BlogsQueryRepository) { }
    async findPost(paginationQuery: QueryPaginationType, userId: string | null): Promise<paginatorPost> {
        return this.postQueryRepo.findPost(paginationQuery, userId)
    }


    async findPostsBlogId(paginationQuery: QueryPaginationType, blogId: string, userId: string|null): Promise<paginatorPost | Number> {
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

    async createdPostBlogId(postData : postInputModel): Promise<postOutput | Number> {
        
        const newPostId = new ObjectId()
        const createdAt = new Date().toISOString();
        let blodName = await this.blogQueryRepository.getBlogNameById(postData.blogId)
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
        const post = await this.postQueryRepo.getPostById(postId)
        if(!post) {
            throw new HttpException('Not Found', HttpStatus.NOT_FOUND)
        }

        post.title = postInputData.title
        post.shortDescription = postInputData.shortDescription
        post.content = postInputData.content
        //post.addLike()

        await this.postRepository.savePost(post)
        //0

        throw new HttpException('No content', HttpStatus.NO_CONTENT)
        //return await this.postRepository.updatePostId(id, title, shortDescription, content, blogId)
    }

    async updateLikeStatusPostId(postId: string, userId: string, likeStatus: string): Promise<boolean | null> {
        return await this.postRepository.updateLikeStatusPostId(postId, userId, likeStatus)
    }
    async deletePostAll(): Promise<boolean> {
        return await this.postRepository.deletePostAll()
    }
}