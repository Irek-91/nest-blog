import { PostsService } from './../../posts/posts.service';
import { Blog } from './entity/blog.entity';
import { QueryPaginationType } from '../../helpers/query-filter';
import { HttpStatus, Injectable } from '@nestjs/common';
import { BlogDocument } from "../models/blogs-schema"
import { Filter, ObjectId } from "mongodb";

import { Model } from "mongoose"
import { blogInput, blogMongoDB, blogOutput, paginatorBlog } from "../models/blogs-model"
import { InjectModel } from '@nestjs/mongoose';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';

@Injectable()
export class BlogsRepoPSQL {
  constructor(@InjectDataSource() private blogModel: DataSource,
              @InjectRepository(Blog) private blogRepoTypeORM: Repository<Blog>,
              protected postService : PostsService
  ) { }

  async createBlog(newBlog: blogMongoDB) {
    //return await this.blogModel.insertMany({ ...newBlog })
    const query = `INSERT INTO public."blogs"(
      _id, name, description, "websiteUrl", "createdAt", "isMembership")
      VALUES  ('${newBlog._id}', '${newBlog.name}', '${newBlog.description}',
                '${newBlog.websiteUrl}', '${newBlog.createdAt}', '${newBlog.isMembership}')
      `
    const user = await this.blogModel.query(query)
    return newBlog
  }

  async updateBlog(blogId: string, bloginputData: blogInput): Promise<Number> {
    try {

      const blog = await this.blogRepoTypeORM.update(
        {_id: blogId}, 
        {name: bloginputData.name, description: bloginputData.description, websiteUrl: bloginputData.websiteUrl}
      )
      // const blog = await this.blogModel.query(`
      // UPDATE public."blogs"
      // SET name=$2, description=$3, "websiteUrl"=$4
      // WHERE "_id" = $1`, [blogId, bloginputData.name,
      //                   bloginputData.description, bloginputData.websiteUrl])
        return HttpStatus.NO_CONTENT
    }
    catch (e) {
      return HttpStatus.NOT_FOUND
    }
  }

  async deleteBlogId(id: string): Promise<Number> {
    try {
      
      const postsDeleted = await this.postService.deletePostsByBlogId(id)
      const blogDeleted = await this.blogRepoTypeORM.delete({
        _id: id
      })
      // const blogDeleted = await this.blogModel.query(`
      // DELETE FROM public."blogs" as b
      // WHERE b."_id" = $1`, [id])
      // const postDeleted = await this.blogModel.query(`
      // DELETE FROM public."posts"
      // WHERE "blogId" = $1`, [id])


      if (!blogDeleted.affected) {return HttpStatus.NO_CONTENT}
      else {return HttpStatus.NOT_FOUND}
    }
    catch (e) { return HttpStatus.NOT_FOUND }

  }

  async deleteBlogAll(): Promise<Number> {
    try {

      const blogsDeleted = await this.blogRepoTypeORM.delete({
      })
      // const blogsDelete = await this.blogModel.query(`
      // DELETE FROM public."blogs"`)
      if (!blogsDeleted.affected) return HttpStatus.NOT_FOUND
      return HttpStatus.NO_CONTENT
    }
    catch (e) { return HttpStatus.NOT_FOUND }
  }
}