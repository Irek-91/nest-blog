import { QueryPaginationType } from '../../helpers/query-filter';
import { HttpStatus, Injectable } from '@nestjs/common';
import { Blog, BlogDocument } from "../models/blogs-schema"
import { Filter, ObjectId } from "mongodb";

import { Model } from "mongoose"
import { blogInput, blogMongoDB, blogOutput, paginatorBlog } from "../models/blogs-model"
import { InjectModel } from '@nestjs/mongoose';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

@Injectable()
export class BlogsRepoPSQL {
  constructor(@InjectDataSource() private blogModel: DataSource) { }

  async createBlog(newBlog: blogMongoDB) {
    //return await this.blogModel.insertMany({ ...newBlog })
    const query = `INSERT INTO public."Blogs"(
      _id, name, description, "websiteUrl", "createdAt", "isMembership")
      VALUES  ('${newBlog._id}', '${newBlog.name}', '${newBlog.description}',
                '${newBlog.websiteUrl}', '${newBlog.createdAt}', '${newBlog.isMembership}')
      `
    const user = await this.blogModel.query(query)
    return newBlog
  }

  async updateBlog(blogId: string, bloginputData: blogInput): Promise<Number> {
    try {
      const blog = await this.blogModel.query(`
      UPDATE public."Blogs"
      SET name=$2, description=$3, "websiteUrl"=$4
      WHERE "_id" = $1`, [blogId, bloginputData.name,
                        bloginputData.description, bloginputData.websiteUrl])
        return HttpStatus.NO_CONTENT
    }
    catch (e) {
      return HttpStatus.NOT_FOUND
    }
  }

  async deleteBlogId(id: string): Promise<Number> {
    try {
      
      const blogDeleted = await this.blogModel.query(`
      DELETE FROM public."Blogs" as b
      WHERE b."_id" = $1`, [id])
      const postDeleted = await this.blogModel.query(`
      DELETE FROM public."Posts"
      WHERE "blogId" = $1`, [id])
      if (blogDeleted[1] > 0) {return HttpStatus.NO_CONTENT}
      else {return HttpStatus.NOT_FOUND}
    }
    catch (e) { return HttpStatus.NOT_FOUND }

  }

  async deleteBlogAll(): Promise<Number> {
    try {
      const blogsDelete = await this.blogModel.query(`
      DELETE FROM public."Blogs"`)
      if (blogsDelete[1] > 0) return HttpStatus.NOT_FOUND
      return HttpStatus.NO_CONTENT
    }
    catch (e) { return HttpStatus.NOT_FOUND }
  }
}