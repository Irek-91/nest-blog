// import { queryPaginationType } from '../../helpers/query-filter';
// import { HttpStatus, Injectable } from '@nestjs/common';
// import { Blog, BlogDocument } from "../models/blogs-schema"
// import { Filter, ObjectId } from "mongodb";

// import { Model } from "mongoose"
// import { blogInput, blogMongoDB, blogOutput, paginatorBlog } from "../models/blogs-model"
// import { InjectModel } from '@nestjs/mongoose';

// @Injectable()
// export class BlogsRepository {
//   constructor(@InjectModel(Blog.name) private blogModel: Model<BlogDocument>) { }

//   async createBlog(newBlog: blogMongoDB) {
//     return await this.blogModel.insertMany({ ...newBlog })

//   }

//   async updateBlog(blogId: string, bloginputData: blogInput): Promise<Number> {
//     try {
//       const blogsInstance = await this.blogModel.findOne({ _id: new ObjectId(blogId) })
//       if (!blogsInstance) {
//         return HttpStatus.NOT_FOUND
//       }
//       else {
//         blogsInstance.name = bloginputData.name
//         blogsInstance.description = bloginputData.description
//         blogsInstance.websiteUrl = bloginputData.websiteUrl

//         await blogsInstance.save()
//         return HttpStatus.NO_CONTENT
//       }
//     }
//     catch (e) {

//       return HttpStatus.NOT_FOUND
//     }
//   }

//   async deleteBlogId(id: string): Promise<Number> {
//     try {
//       const blogsInstance = await this.blogModel.findOne({ _id: new ObjectId(id) })
//       if (!blogsInstance) return HttpStatus.NOT_FOUND
//       await blogsInstance.deleteOne()
//       return HttpStatus.NO_CONTENT
//     }
//     catch (e) { return HttpStatus.NOT_FOUND }

//   }

//   async deleteBlogAll(): Promise<Number> {
//     try {
//       const blogsInstance = await this.blogModel.deleteMany({})
//       if (!blogsInstance) return HttpStatus.NOT_FOUND
//       return HttpStatus.NO_CONTENT
//     }
//     catch (e) { return HttpStatus.NOT_FOUND }
//   }
// }