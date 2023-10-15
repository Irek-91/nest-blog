import { Body, Controller, Get, Post, Put, Delete, Query, Param, HttpException} from "@nestjs/common";
import { getPaginationFromQuery } from "src/helpers/query-filter";
import { BlogsService } from "./blogs.service";
import { log } from "console";
import { blogInput, blogOutput } from "./models/blogs-model";
import { HttpStatus, Injectable } from '@nestjs/common';

@Controller('blogs')
export class BlogsController {
    constructor(protected blogsService: BlogsService,
    ) {
    }
    @Get()
    async getBlogs(@Query()
    query: {
        searchNameTerm?: string;
        sortBy?: string;
        sortDirection?: string;
        pageNumber?: string;
        pageSize?: string;
    }) {
        const queryFilter = getPaginationFromQuery(query);
        return await this.blogsService.findBlogs(queryFilter)
    }
    @Get(':id')
    async getBlogId(@Param('id') blogId: string) {
        const blog = await this.blogsService.getBlogId(blogId)
        if (blog === HttpStatus.NOT_FOUND) {
            throw new HttpException('Not Found', HttpStatus.NOT_FOUND);
        } else {
            return blog
        }
    }

    @Post()
    async createBlog(@Body() blogInputData: blogInput) {
        const blog = await this.blogsService.createBlog(blogInputData)
        return blog

    }
    @Put(':id')
    async updateBlog(@Param('id') blogId: string,
    @Body() blogInputData : blogInput) {
        const blogUpdate = await this.blogsService.updateBlog(blogId, blogInputData)
        
        if (blogUpdate === HttpStatus.NOT_FOUND) {
            throw new HttpException('Not Found', HttpStatus.NOT_FOUND);
        } else {
            throw new HttpException('No Content', HttpStatus.NO_CONTENT)
        }
    }

    




}