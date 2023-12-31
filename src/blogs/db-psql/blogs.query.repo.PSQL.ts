import { QueryPaginationType } from '../../helpers/query-filter';
import { HttpStatus, Injectable, HttpException } from '@nestjs/common';
import { BlogDocument } from "../models/blogs-schema"
import { Filter, ObjectId } from "mongodb";

import { Model } from "mongoose"
import { blogInput, blogMongoDB, blogOutput, paginatorBlog } from "../models/blogs-model"
import { InjectModel } from '@nestjs/mongoose';
import { log } from 'console';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { DataSource, ILike, Repository } from 'typeorm';
import { Blog } from './entity/blog.entity';

@Injectable()
export class BlogsQueryRepoPSQL {
  constructor(
              @InjectDataSource() private blogModel: DataSource,
              @InjectRepository(Blog) private blogRepoTypeORM: Repository<Blog>,
  ) { }

  async findBlogs(pagination: QueryPaginationType): Promise<paginatorBlog> {
    // let query = `SELECT * FROM public."blogs"
    //                 ORDER BY "${pagination.sortBy}" ${pagination.sortDirection}                 
    //          `
    const sortDirection= pagination.sortDirection

    let sortBy = {
    }

    if (pagination.sortBy === 'name') {
      sortBy = {
        name: sortDirection
      }
    } else {
      sortBy = {
        createdAt: sortDirection
      }
    }

    const sortByWithCollate = pagination.sortBy !== 'createdAt' ? 'COLLATE "C"' : '';
    // if (pagination.searchNameTerm !== '') {
    //     // query = `SELECT * FROM public."blogs"
    //     //         WHERE "name" ILIKE '%${pagination.searchNameTerm}%'
    //     //         ORDER BY "${pagination.sortBy}" ${sortByWithCollate} ${pagination.sortDirection}
    //     //         `
    //     query = {
    //       where:{name: ILike(`%${pagination.searchNameTerm}%`)},
    //       // order: {
    //       //   sortBy: pagination.sortDirection
    //       // }
    //     }
    // }
    

    // const queryResult = `${query} ` + ` LIMIT $1 OFFSET $2`
    // const blogs = await this.blogModel.query(queryResult,
    //     [pagination.pageSize, pagination.skip])
    const blogs = await this.blogRepoTypeORM.find({
      where: {name: ILike(`%${pagination.searchNameTerm}%`)},
      order: sortBy,
      skip: pagination.skip,
      take: pagination.pageSize
    })
   
    
    // find({ name: { $regex: pagination.searchNameTerm, $options: 'i' } }).
    //   //sort([[pagination.sortBy, pagination.sortDirection]]).
    //   skip(pagination.skip).
    //   limit(pagination.pageSize).
    //   lean()
    
    
    const totalCount = await this.blogRepoTypeORM.findAndCount({
        where: {
          name: ILike(`%${pagination.searchNameTerm}%`)
        }
      }
    )
    
    const blogsOutput: blogOutput[] = blogs.map((b) => {
      return {
        id: b._id,
        name: b.name,
        description: b.description,
        websiteUrl: b.websiteUrl,
        createdAt: b.createdAt,
        isMembership: b.isMembership,
      }
    })
    return {
      pagesCount: Math.ceil(totalCount[1] / pagination.pageSize),
      page: pagination.pageNumber,
      pageSize: pagination.pageSize,
      totalCount: totalCount[1],
      items: blogsOutput
    }
  }

  async getBlogId(id: string): Promise<blogOutput> {
    try {

      const blog = await this.blogRepoTypeORM.findOneBy({_id: id})
      
      if (!blog) {throw new HttpException('Not found', HttpStatus.NOT_FOUND)}
      else {
      return {
        id: blog._id.toString(),
        name: blog.name,
        description: blog.description,
        websiteUrl: blog.websiteUrl,
        createdAt: blog.createdAt,
        isMembership: false,
      }

      }
      // const blog = await this.blogModel.query(`
      //   SELECT * FROM public."blogs" as b
      //   WHERE b."_id" = $1
      //   `, [id])
      // if (blog.length === 0) throw new HttpException('Not found', HttpStatus.NOT_FOUND)//return HttpStatus.NOT_FOUND
      // return {
      //   id: blog[0]._id.toString(),
      //   name: blog[0].name,
      //   description: blog[0].description,
      //   websiteUrl: blog[0].websiteUrl,
      //   createdAt: blog[0].createdAt,
      //   isMembership: false,
      // }
    }
    catch (e) {
      throw new HttpException('Not found', HttpStatus.NOT_FOUND)
    }
  }
  async getBlogNameById(id: string): Promise<string | null> {
    try {
      const blog = await this.blogRepoTypeORM.findOneBy({_id: id})
      if (!blog) {return null}
      return blog.name

      // const blog = await this.blogModel.query(`
      //   SELECT * FROM public."blogs" as b
      //   WHERE b."_id" = $1
      //   `, [id])
      // if (blog.length === 0) return null
      // return blog[0].name
    }
    catch (e) {
      return null
    }
  }


  async getByBlogId(id: string): Promise< Blog | null> {
    try {
      const blog = await this.blogRepoTypeORM.findOneBy({_id: id})
      if (!blog) {return null}
      return blog

      //   const blog = await this.blogModel.query(`
      //   SELECT * FROM public."blogs" as b
      //   WHERE b."_id" = $1
      //   `, [id])
      // if (blog.length === 0) return null
      // return blog
    }
    catch (e) {
      return null
    }
  }
}