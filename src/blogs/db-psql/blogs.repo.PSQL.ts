import { blogPSQLDB } from './../models/blogs-model';
import { User } from './../../users/db-psql/entity/user.entity';
import { DeletePostsByBlogIdCommand } from './../../posts/application/use-case/delete.posts.by.blog.id.use.case';
import { PostsService } from '../../posts/application/posts.service';
import { Blog } from './entity/blog.entity';
import { queryPaginationType } from '../../helpers/query-filter';
import { HttpStatus, Injectable } from '@nestjs/common';
import { BlogDocument } from "../models/blogs-schema"
import { Filter, ObjectId } from "mongodb";
import { v4 as uuidv4 } from 'uuid';

import { Model } from "mongoose"
import { blogInput, blogMongoDB, blogOutput, paginatorBlog } from "../models/blogs-model"
import { InjectModel } from '@nestjs/mongoose';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { log } from 'console';
import { CommandBus } from '@nestjs/cqrs';

@Injectable()
export class BlogsRepoPSQL {
  constructor(@InjectDataSource() private dataSource: DataSource,
    @InjectRepository(Blog) private blogRepoTypeORM: Repository<Blog>,

    protected postService: PostsService,
    private commandBus: CommandBus
  ) { }

  async createBlog(inputData: blogPSQLDB) {
    const queryRunner = this.dataSource.createQueryRunner()
    const manager = queryRunner.manager
    await queryRunner.connect()

    await queryRunner.startTransaction()
    try {
      const newBlog = this.dataSource.createQueryBuilder()
        .insert()
        .into(Blog)
        .values({
          _id: inputData._id,
          name: inputData.name,
          description: inputData.description,
          websiteUrl: inputData.websiteUrl,
          createdAt: inputData.createdAt,
          isMembership: inputData.isMembership,
          userId: inputData.userId,
          userLogin: inputData.userLogin
        })
        .execute()
      return newBlog
    } catch (e) {
      await queryRunner.rollbackTransaction()
      return null
    } finally {
      await queryRunner.release()
    }
  }

  async updateBlog(blogId: string, bloginputData: blogInput): Promise<Number> {
    try {

      const blog = await this.blogRepoTypeORM.update(
        { _id: blogId },
        { name: bloginputData.name, description: bloginputData.description, websiteUrl: bloginputData.websiteUrl }
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

      const postsDeleted = await this.commandBus.execute(new DeletePostsByBlogIdCommand(id))
      const blogDeleted = await this.blogRepoTypeORM.delete({
        _id: id
      })
      // const blogDeleted = await this.blogModel.query(`
      // DELETE FROM public."blogs" as b
      // WHERE b."_id" = $1`, [id])
      // const postDeleted = await this.blogModel.query(`
      // DELETE FROM public."posts"
      // WHERE "blogId" = $1`, [id])


      if (!blogDeleted.affected) {
        return HttpStatus.NOT_FOUND
      }
      else {
        return HttpStatus.NO_CONTENT
      }
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