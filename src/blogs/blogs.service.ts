import { QueryPaginationType } from "src/helpers/query-filter"
import { BlogsRepository } from "./blogs.repo"
import { blogInput, blogMongoDB, blogOutput } from "./models/blogs-model"
import { Blog } from "./models/blogs-schema"
import mongoose from "mongoose"
import { Injectable } from "@nestjs/common"

@Injectable()
export class BlogsService {
    constructor (protected blogsRepository : BlogsRepository) {
    }
    
    async findBlogs(paginationQuery: QueryPaginationType) {
        return await this.blogsRepository.findBlogs(paginationQuery)
    }

    async getBlogId(id: string): Promise<blogOutput | Number> {
        return await this.blogsRepository.getBlogId(id)
    }

    async getBlogNameById(id: string): Promise<string | Number> {
        return await this.blogsRepository.getBlogNameById(id)
    }

    async createBlog(blogInputData: blogInput): Promise<blogOutput> {
        const createdAt = new Date().toISOString()
        const newBlog : blogMongoDB = {_id: new mongoose.Types.ObjectId(),
            name: blogInputData.name,
            description: blogInputData.description,
            websiteUrl: blogInputData.websiteUrl,
            createdAt,
            isMembership: false
        }
        
        //const newBlogInstance = new Blog(newBlog)


        await this.blogsRepository.createBlog(newBlog)
        return {
            id: newBlog._id.toString(),
            name: newBlog.name,
            description: newBlog.description,
            websiteUrl: newBlog.websiteUrl,
            createdAt: newBlog.createdAt,
            isMembership: newBlog.isMembership
        }
    }

    async updateBlog(blogId: string, blogInputData: blogInput): Promise<Number> {
        return await this.blogsRepository.updateBlog(blogId, blogInputData)
    }

    async deleteBlogId(id: string): Promise<Number> {
        return await this.blogsRepository.deleteBlogId(id)
    }

    async deleteBlogAll(): Promise<Number> {
        return await this.blogsRepository.deleteBlogAll()
    }
}