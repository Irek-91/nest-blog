import { Injectable } from "@nestjs/common"
import { PostRepository } from "./post.repo"
import { QueryPaginationType } from "src/helpers/query-filter"
import { paginatorPost, postOutput } from "./model/post-model"

@Injectable()

export class PostsService {

    constructor (protected postRepository: PostRepository) { }
    async findPost(paginationQuery: QueryPaginationType, userId: string | null): Promise<paginatorPost> {
        return this.postRepository.findPost(paginationQuery, userId)
    }


    async findPostsBlogId(paginationQuery: QueryPaginationType, blogId: string, userId: string|null): Promise<paginatorPost | boolean> {
        return this.postRepository.findPostsBlogId(paginationQuery, blogId, userId)
    }

    async getPostId(id: string, userId: string | null): Promise<postOutput | number> {
        return this.postRepository.getPostId(id, userId)
    }

    async deletePostId(id: string): Promise<boolean> {
        return await this.postRepository.deletePostId(id)
    }

    async createdPostBlogId(title: string, shortDescription: string, content: string, blogId: string, blogName: string | boolean): Promise<postOutput | boolean> {

        const creatPost = await this.postRepository.createdPostId(title, shortDescription, content, blogId, blogName)
        return creatPost
    }

    async updatePostId(id: string, title: string, shortDescription: string, content: string, blogId: string): Promise<boolean> {
        //100
        const post = await this.postRepository.getPostById(id)
        if(!post) {
            throw new Error('not found')
        }

        if (!post) return false
        post.title = title
        post.shortDescription = shortDescription
        post.content = content
        //post.addLike()

        await this.postRepository.savePost(post)
        //0

        return true
        //return await this.postRepository.updatePostId(id, title, shortDescription, content, blogId)
    }

    async updateLikeStatusPostId(postId: string, userId: string, likeStatus: string): Promise<boolean | null> {
        return await this.postRepository.updateLikeStatusPostId(postId, userId, likeStatus)
    }
    async deletePostAll(): Promise<boolean> {
        return await this.postRepository.deletePostAll()
    }
}