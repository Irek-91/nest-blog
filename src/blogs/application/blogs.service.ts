import { queryPaginationType } from '../../helpers/query-filter';
import { blogInput, blogMongoDB, blogOutput } from '../models/blogs-model';
import mongoose from 'mongoose';
import { Injectable } from '@nestjs/common';
import { BlogsRepoPSQL } from '../db-psql/blogs.repo.PSQL';
import { BlogsQueryRepoPSQL } from '../db-psql/blogs.query.repo.PSQL';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class BlogsService {
  constructor(
    protected blogsRepository: BlogsRepoPSQL,
    protected blogsQueryRepository: BlogsQueryRepoPSQL,
  ) {}

  // async findBlogs(paginationQuery: queryPaginationType) {
  //     return await this.blogsQueryRepository.findBlogs(paginationQuery)
  // }

  // async getBlogId(id: string): Promise<blogOutput> {
  //     return await this.blogsQueryRepository.getBlogId(id)
  // }

  // async getBlogNameById(id: string): Promise<string | null> {
  //     return await this.blogsQueryRepository.getBlogNameById(id)
  // }

  // async createBlog(blogInputData: blogInput): Promise<blogOutput> {
  //     const createdAt = new Date().toISOString()
  //     const newBlog : blogMongoDB = {_id: uuidv4(),
  //         name: blogInputData.name,
  //         description: blogInputData.description,
  //         websiteUrl: blogInputData.websiteUrl,
  //         createdAt,
  //         isMembership: false
  //     }

  //     //const newBlogInstance = new Blog(newBlog)

  //     await this.blogsRepository.createBlog(newBlog)
  //     return {
  //         id: newBlog._id.toString(),
  //         name: newBlog.name,
  //         description: newBlog.description,
  //         websiteUrl: newBlog.websiteUrl,
  //         createdAt: newBlog.createdAt,
  //         isMembership: newBlog.isMembership
  //     }
  // }

  // async updateBlog(blogId: string, blogInputData: blogInput): Promise<Number> {
  //     return await this.blogsRepository.updateBlog(blogId, blogInputData)
  // }

  // async deleteBlogId(id: string): Promise<Number> {
  //     return await this.blogsRepository.deleteBlogId(id)
  // }
}
