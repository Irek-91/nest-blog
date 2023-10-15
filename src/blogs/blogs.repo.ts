import { HttpStatus, Injectable } from '@nestjs/common';
import { Blog, BlogDocument } from "./models/blogs-schema"
import { Filter, ObjectId } from "mongodb";

import { Model } from "mongoose"
import { QueryPaginationType, QueryPaginationTypeUser } from "src/helpers/query-filter"
import { blogInput, blogMongoDB, blogOutput, paginatorBlog } from "./models/blogs-model"
import { InjectModel } from '@nestjs/mongoose';

@Injectable()
export class BlogsRepository  {
constructor(@InjectModel(Blog.name) private blogModel: Model<BlogDocument>) { }

async findBlogs(pagination: QueryPaginationType): Promise<paginatorBlog> {
    const blogs = await this.blogModel.
      find({ name: { $regex: pagination.searchNameTerm, $options: 'i' } }).
      sort([[pagination.sortBy, pagination.sortDirection]]).
      skip(pagination.skip).
      limit(pagination.pageSize).
      lean()
    const totalCount = await this.blogModel.countDocuments({ name: { $regex: pagination.searchNameTerm, $options: 'i' } })
    const blogsOutput: blogOutput[] = blogs.map((b) => {
      return {
        id: b._id.toString(),
        name: b.name,
        description: b.description,
        websiteUrl: b.websiteUrl,
        createdAt: b.createdAt,
        isMembership: b.isMembership,
      }
    })
    return {
      pagesCount: Math.ceil(totalCount / pagination.pageSize),
      page: pagination.pageNumber,
      pageSize: pagination.pageSize,
      totalCount: totalCount,
      items: blogsOutput
    }
  }
  
  async getBlogId(id: string): Promise<blogOutput | Number> {
    try {
      const blog = await this.blogModel.findOne({ _id: new ObjectId(id) }).lean()
      if (!blog) return HttpStatus.NOT_FOUND
      return {
        id: blog._id.toString(),
        name: blog.name,
        description: blog.description,
        websiteUrl: blog.websiteUrl,
        createdAt: blog.createdAt,
        isMembership: false,
      }
    }
    catch (e) {
      return HttpStatus.NOT_FOUND
    }
  }
  async getBlogNameById(id: string): Promise<string | Number> {
    try {
      const blog = await this.blogModel.findOne({ _id: new ObjectId(id) }).lean()
      if (!blog) return HttpStatus.NOT_FOUND
      return blog.name
    }
    catch (e) {
      return HttpStatus.NOT_FOUND
    }
  }



  async createBlog(newBlog: blogMongoDB) {
    return await this.blogModel.insertMany({ ...newBlog })

  }

  async updateBlog(blogId: string, bloginputData : blogInput): Promise<Number> {
    try {
      const blogsInstance = await this.blogModel.findOne({ _id: new ObjectId(blogId) })
      if (!blogsInstance) {
        return HttpStatus.NOT_FOUND
      }
      else {
        blogsInstance.name = bloginputData.name
        blogsInstance.description = bloginputData.description
        blogsInstance.websiteUrl = bloginputData.websiteUrl

        await blogsInstance.save()
        return HttpStatus.NO_CONTENT
      }
    }
    catch (e) {

      return HttpStatus.NOT_FOUND
    }
  }

  async deleteBlogId(id: string): Promise<Number> {
    try {
      const blogsInstance = await this.blogModel.findOne({ _id: new ObjectId(id) })
      if (!blogsInstance) return HttpStatus.NOT_FOUND
      await blogsInstance.deleteOne()
      return HttpStatus.NO_CONTENT
    }
    catch (e) { return HttpStatus.NOT_FOUND }

  }

  async deleteBlogAll(): Promise<Number> {
    try {
      const blogsInstance = await this.blogModel.deleteMany({})
      if (!blogsInstance) return HttpStatus.NOT_FOUND 
      return HttpStatus.NO_CONTENT
    }
    catch (e) { return HttpStatus.NOT_FOUND}
  }
}