import { User } from './../../users/db-psql/entity/user.entity';
import { blogSAOutput, paginatorBlogSA } from './../models/blogs-model';
import { queryPaginationType } from '../../helpers/query-filter';
import { HttpStatus, Injectable, HttpException } from '@nestjs/common';
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
    
    let blogsOne = await this.dataSource
      .createQueryBuilder(Blog, 'b')
      .leftJoinAndSelect('b.blogger', 'u')
      .where('b.banStatus = :banStatus', { banStatus: false })
      .andWhere(`${pagination.searchNameTerm !== null ? `b.name ILIKE '%${pagination.searchNameTerm}%'` : `b.name is not null`}`)
      // .andWhere('u._id = :userId', {
      //   userId: userId
      // })
      .orderBy(`b.${pagination.sortBy}`, pagination.sortDirection)
      .skip(pagination.skip)
      .take(pagination.pageSize)
      .getMany()

    let totalCount = await this.dataSource
      .createQueryBuilder(Blog, 'b')
      .leftJoinAndSelect(User, "u", "u._id = b.blogger")
      .where('b.banStatus = :banStatus', { banStatus: false })
      .andWhere(`${pagination.searchNameTerm !== null ? `b.name ILIKE '%${pagination.searchNameTerm}%'` : `b.name is not null`}`)
      // .andWhere('u._id = :userId', {
      //   userId: userId
      // })
      .getMany()

    if (userId !== null) {
      blogsOne = await this.dataSource
        .createQueryBuilder(Blog, 'b')
        .leftJoinAndSelect('b.blogger', 'u')
        .where('b.banStatus = :banStatus', { banStatus: false })
        .andWhere(`${pagination.searchNameTerm !== null ? `b.name ILIKE '%${pagination.searchNameTerm}%'` : `b.name is not null`}`)
        .andWhere('u._id = :userId', {
          userId: userId
        })
        .orderBy(`b.${pagination.sortBy}`, pagination.sortDirection)
        .skip(pagination.skip)
        .take(pagination.pageSize)
        .getMany()

      totalCount = await this.dataSource
        .createQueryBuilder(Blog, 'b')
        .leftJoinAndSelect(User, "u", "u._id = b.blogger")
        .where('b.banStatus = :banStatus', { banStatus: false })
        .andWhere(`${pagination.searchNameTerm !== null ? `b.name ILIKE '%${pagination.searchNameTerm}%'` : `b.name is not null`}`)
        .andWhere('u._id = :userId', {
          userId: userId
        })
        .getMany()
    }


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

    let blogsOne = await this.dataSource
      .createQueryBuilder(Blog, 'b')
      .leftJoinAndSelect('b.blogger', 'u')
      .where(`${pagination.searchNameTerm !== null ? `b.name ILIKE '%${pagination.searchNameTerm}%'` : `b.name is not null`}`)
      .orderBy(`b.${pagination.sortBy}`, pagination.sortDirection)
      .skip(pagination.skip)
      .take(pagination.pageSize)
      .getMany()




    const totalCount = await this.dataSource.getRepository(Blog)
      .createQueryBuilder('b')
      .leftJoinAndSelect('b.blogger', 'u')
      .where(`${pagination.searchNameTerm !== null ? `b.name ILIKE '%${pagination.searchNameTerm}%'` : `b.name is not null`}`)
      .getMany()

    const blogsOutput: blogSAOutput[] = blogsOne.map((b) => {
      return {
        id: b._id,
        name: b.name,
        description: b.description,
        websiteUrl: b.websiteUrl,
        createdAt: b.createdAt,
        isMembership: b.isMembership,
        blogOwnerInfo: {
          userId: b.blogger._id,
          userLogin: b.blogger.login
        },
        banInfo: {
          banDate: b.banDate,
          isBanned: b.banStatus
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

      let blog = await this.dataSource
      .createQueryBuilder(Blog, 'b')
      .leftJoinAndSelect('b.blogger', 'u')
      .where('b.banStatus = :banStatus', { banStatus: false })
      .andWhere({ _id: id })
      .getOne()

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

  async getSABlogId(id: string): Promise<blogOutput | null> {
    try {
      let blog = await this.dataSource
      .createQueryBuilder(Blog, 'b')
      .leftJoinAndSelect('b.blogger', 'u')
      .andWhere({ _id: id })
      .getOne()

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
    }
    catch (e) {
      return null
    }
  }


  async getBlogDBById(id: string): Promise<Blog | null> {
    try {
      const blog = await this.dataSource
        .createQueryBuilder(Blog, 'b')
        .leftJoinAndSelect('b.blogger', 'u')
        .where({ _id: id })
        .getOne()
      if (!blog) { return null }
      return blog
    }
    catch (e) {
      return null
    }
  }

  async getBlogsByBlogger(bloggerId: string): Promise<Blog | null> {
    try {
      const blog = await this.dataSource.getRepository(Blog)
        .findOne({
          relations: {
            blogger: true
          },
          where: {
            blogger: {
              _id: bloggerId
            }
          }
        })

      if (!blog) { return null }
      return blog
    }
    catch (e) {
      return null
    }
  }
}