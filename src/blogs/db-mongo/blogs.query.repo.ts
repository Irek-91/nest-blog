// import { queryPaginationType } from '../../helpers/query-filter';
// import { HttpStatus, Injectable, HttpException } from '@nestjs/common';
// import { Blog, BlogDocument } from "../models/blogs-schema"
// import { Filter, ObjectId } from "mongodb";

// import { Model } from "mongoose"
// import { blogInput, blogMongoDB, blogOutput, paginatorBlog } from "../models/blogs-model"
// import { InjectModel } from '@nestjs/mongoose';
// import { log } from 'console';

// @Injectable()
// export class BlogsQueryRepository {
//   constructor(@InjectModel(Blog.name) private blogModel: Model<BlogDocument>) { }

//   async findBlogs(pagination: queryPaginationType): Promise<paginatorBlog> {
//     const blogs = await this.blogModel.
//       find({ name: { $regex: pagination.searchNameTerm, $options: 'i' } }).
//       //sort([[pagination.sortBy, pagination.sortDirection]]).
//       skip(pagination.skip).
//       limit(pagination.pageSize).
//       lean()
//     const totalCount = await this.blogModel.countDocuments({ name: { $regex: pagination.searchNameTerm, $options: 'i' } })
//     const blogsOutput: blogOutput[] = blogs.map((b) => {
//       return {
//         id: b._id.toString(),
//         name: b.name,
//         description: b.description,
//         websiteUrl: b.websiteUrl,
//         createdAt: b.createdAt,
//         isMembership: b.isMembership,
//       }
//     })
//     return {
//       pagesCount: Math.ceil(totalCount / pagination.pageSize),
//       page: pagination.pageNumber,
//       pageSize: pagination.pageSize,
//       totalCount: totalCount,
//       items: blogsOutput
//     }
//   }

//   async getBlogId(id: string): Promise<blogOutput> {
//     try {
//       const blog = await this.blogModel.findOne({ _id: id }).lean()
//       if (!blog) throw new HttpException('Not found', HttpStatus.NOT_FOUND)//return HttpStatus.NOT_FOUND
//       return {
//         id: blog._id.toString(),
//         name: blog.name,
//         description: blog.description,
//         websiteUrl: blog.websiteUrl,
//         createdAt: blog.createdAt,
//         isMembership: false,
//       }
//     }
//     catch (e) {
//       throw new HttpException('Not found', HttpStatus.NOT_FOUND)
//     }
//   }
//   async getBlogNameById(id: string): Promise<string | Number> {
//     try {
//       const blog = await this.blogModel.findOne({ _id: id}).lean()
//       if (!blog) return HttpStatus.NOT_FOUND
//       return blog.name
//     }
//     catch (e) {
//       return HttpStatus.NOT_FOUND
//     }
//   }

//   async getByBlogId(id: string): Promise< BlogDocument | null> {
//     try {
//       const blog = await this.blogModel.findOne({ _id: id }).lean()
//       return blog
//     }
//     catch (e) {
//       return null
//     }
//   }
// }
