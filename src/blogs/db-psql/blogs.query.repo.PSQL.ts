import { blogSAOutput, paginatorBlogSA } from './../models/blogs-model';
import { queryPaginationType } from '../../helpers/query-filter';
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
  constructor(@InjectDataSource() private dataSource: DataSource,
    //@InjectRepository(Blog) private blogRepoTypeORM: Repository<Blog>,
  ) { }

  async findBlogs(pagination: queryPaginationType, userId: string | null): Promise<paginatorBlog> {
    // let query = `SELECT * FROM public."blogs"
    //                 ORDER BY "${pagination.sortBy}" ${pagination.sortDirection}                 
    //          `
    const sortDirection = pagination.sortDirection

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

    let blogsOne = await this.dataSource.getRepository(Blog)
      .createQueryBuilder('b')
      .where({ name: ILike(`%${pagination.searchNameTerm}%`) })
      .andWhere('b.userId = :userId', {
        userId: userId
      })
      .orderBy(`b.${pagination.sortBy}`, pagination.sortDirection)
      .skip(pagination.skip)
      .take(pagination.pageSize)
      .getMany()


    const totalCount = await this.dataSource.getRepository(Blog)
      .createQueryBuilder('b')
      .where({ name: ILike(`%${pagination.searchNameTerm}%`) })
      .andWhere('b.userId = :userId', {
        userId: userId
      })
      .getMany()

    const blogsOutput: blogOutput[] = blogsOne.map((b) => {
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
      pagesCount: Math.ceil(totalCount.length / pagination.pageSize),
      page: pagination.pageNumber,
      pageSize: pagination.pageSize,
      totalCount: totalCount.length,
      items: blogsOutput
    }
  }

  async findBlogsSA(pagination: queryPaginationType): Promise<paginatorBlogSA> {
            
    const sortDirection = pagination.sortDirection
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

    let blogsOne = await this.dataSource.getRepository(Blog)
      .createQueryBuilder('b')
      .where({ name: ILike(`%${pagination.searchNameTerm}%`) })
      .orderBy(`b.${pagination.sortBy}`, pagination.sortDirection)
      .skip(pagination.skip)
      .take(pagination.pageSize)
      .getMany()


    const totalCount = await this.dataSource.getRepository(Blog)
      .createQueryBuilder('b')
      .where({ name: ILike(`%${pagination.searchNameTerm}%`) })
      .getMany()

    const blogsOutput: blogSAOutput[] = blogsOne.map((b) => {
      return {
        id: b._id,
        name: b.name,
        description: b.description,
        websiteUrl: b.websiteUrl,
        createdAt: b.createdAt,
        isMembership: b.isMembership,
        blogOwnerInfo : {
          userId :b.userId!,
          userLogin: b.userLogin!
        }
      }
    })
    return {
      pagesCount: Math.ceil(totalCount.length / pagination.pageSize),
      page: pagination.pageNumber,
      pageSize: pagination.pageSize,
      totalCount: totalCount.length,
      items: blogsOutput
    }
  }
  async getBlogId(id: string): Promise<blogOutput | null> {
    try {

      const blog = await this.dataSource.getRepository(Blog).createQueryBuilder().where({ _id: id }).getOne()

      if (!blog) { return null }
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
    }
    catch (e) {
      return null
    }
  }
  async getBlogNameById(id: string): Promise<string | null> {
    try {
      const blog = await this.dataSource.getRepository(Blog).createQueryBuilder().where({ _id: id }).getOne()
      if (!blog) { return null }
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


  async getBlogDBById(id: string): Promise<Blog | null> {
    try {
      const blog = await this.dataSource.getRepository(Blog).createQueryBuilder().where({ _id: id }).getOne()
      if (!blog) { return null }
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