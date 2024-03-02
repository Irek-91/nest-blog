import { SaveImageForPostCommand } from './../posts/application/use-case/save.image.for.post.use.case';
import { paginationGetCommentsByBlog } from './../comments/model/comments-model';
import { GetCommentsByBlogCommand } from './../comments/application/use-case/get.comments.by.blog.use.cae';
import { BanUserByBloggerCommand } from './../users/application/use-case/ban.user.by.blogger.use.case';
import { BanUserByBloggerInputModel } from './../users/models/users-model';
import { PipeisValidUUID, FileValidationPipe, FileWallpaperValidationPipe, FileMainValidationPipe, PostImageValidationPipe } from './../adapters/pipe';
import { UpdatePostCommand } from './../posts/application/use-case/update.post.use.case';
import { FindPostsByBlogIdCommand } from './../posts/application/use-case/find.posts.by.blog.id.use.case';
import { CreatedPostByBlogIdCommand } from './../posts/application/use-case/created.post.by.blog.id.use.case';
import { postInputModelSpecific, postImagesViewModel } from './../posts/model/post-model';
import { UpdateBlogCommand } from './application/use-case/update.blog.use.case';
import { GetBlogDBCommand } from './application/use-case/get.blog.DB.use.case';
import { DeleteBlogIdCommand } from './application/use-case/delete.blog.id.use.case';
import { FindBlogsCommand } from './application/use-case/find.blogs.use.case';
import { blogInput, paginatorBlog, blogsImageWiewModel } from './models/blogs-model';
import { CreateBlogCommand } from './application/use-case/create.blog.use.case';
import { UserAuthGuard } from './../auth/guards/auth.guard';
import { CommandBus } from '@nestjs/cqrs';
import { Pagination } from './../helpers/query-filter';
import { PostsService } from './../posts/application/posts.service';
import { BlogsService } from './application/blogs.service';
import { BadRequestException, Body, Controller, Delete, FileTypeValidator, Get, HttpCode, HttpException, HttpStatus, MaxFileSizeValidator, Param, ParseFilePipe, ParseFilePipeBuilder, Post, Put, Query, Request, UploadedFile, UseGuards, UseInterceptors } from "@nestjs/common";
import { paginatorPost, postInputModel, postOutput } from '../posts/model/post-model';
import { DeletePostIdCommand } from './../posts/application/use-case/delete.post.id.use.case';
import { Blog } from './db-psql/entity/blog.entity';
import { FileInterceptor } from '@nestjs/platform-express';
import { SaveMainImageForBlogCommand } from './application/use-case/save.main.image.for.blog.use.case';
import { extname } from 'path';
import { SaveWallpaperImageForBlogCommand } from './application/use-case/save.wallpaper.image.for.blog.use.case';
import { log } from 'console';
import { GetPostIdCommand } from '../posts/application/use-case/get.post.id.use.case';


@UseGuards(UserAuthGuard)
@Controller('blogger')
export class BloggerController {
    constructor(protected blogsService: BlogsService,
        protected postsService: PostsService,
        private readonly pagination: Pagination,
        private commandBus: CommandBus
    ) {
    }


    @Get('blogs')
    async getBlogs(@Query()
    query: {
        searchNameTerm?: string;
        sortBy?: string;
        sortDirection?: string;
        pageNumber?: string;
        pageSize?: string;
    }, @Request() req: any) {
        const userId = req.userId//исправить после авторизации

        const queryFilter = this.pagination.getPaginationFromQuery(query);
        const blogs: paginatorBlog = await this.commandBus.execute(new FindBlogsCommand(queryFilter, userId))
        if (!blogs) {
            throw new HttpException('Not Found', HttpStatus.NOT_FOUND)
        } else {
            return blogs
        }
    }

    @Get('blogs/comments')
    async getCommentsPostsByBlog(@Query()
    query: {
        sortBy?: string;
        sortDirection?: string;
        pageNumber?: string;
        pageSize?: string;
    }, @Request() req: any) {
        const userId = req.userId

        const queryFilter = this.pagination.getPaginationFromQuery(query);
        const comments: paginationGetCommentsByBlog | null = await this.commandBus.execute(new GetCommentsByBlogCommand(userId, queryFilter))

        if (!comments) {
            throw new HttpException('Not Found', HttpStatus.NOT_FOUND)
        } else {
            return comments
        }
    }





    @Get('blogs/:blogId/posts')
    async getPostsByBlogId(@Query()
    query: {
        searchNameTerm?: string;
        sortBy?: string;
        sortDirection?: string;
        pageNumber?: string;
        pageSize?: string;
    },
        @Request() req: any,
        @Param('blogId') blogId: string) {
        let userId = req.userId//исправить после авторизации
        if (!userId) {
            userId = null
        }
        const pagination = this.pagination.getPaginationFromQuery(query)
        const blog = await this.commandBus.execute(new GetBlogDBCommand(blogId))
        if (!blog) {
            throw new HttpException('Not Found', HttpStatus.NOT_FOUND)
        }

        const foundPosts:paginatorPost | null = await this.commandBus.execute(new FindPostsByBlogIdCommand(pagination, blogId, userId));
        if (!foundPosts) {
            throw new HttpException('Not Found', HttpStatus.NOT_FOUND)
        } else {
            return foundPosts
        }
    }



    @Post('blogs')
    async createBlogByBlogger(@Body() blogInputData: blogInput,
        @Request() req: any) {
        const userId = req.userId//исправить после авторизации
        const blog = await this.commandBus.execute(new CreateBlogCommand(blogInputData, userId))
        return blog
    }


    @Post('blogs/:blogId/posts')
    async createPostByBlog(@Param('blogId', new PipeisValidUUID()) blogId: string,
        @Body() inputData: postInputModelSpecific,
        @Request() req: any) {
        const userId = req.userId//исправить после авторизации
        const inputDataModel = {
            title: inputData.title,
            shortDescription: inputData.shortDescription,
            content: inputData.content,
            blogId: blogId,
        }
        const blog: Blog | null = await this.commandBus.execute(new GetBlogDBCommand(blogId))
        if (!blog) {
            throw new HttpException('Not Found', HttpStatus.NOT_FOUND)
        }
        if (blog.blogger._id !== userId) {
            throw new HttpException('Forbidden', HttpStatus.FORBIDDEN);
        }
        const newPost: postOutput | null = await this.commandBus.execute(new CreatedPostByBlogIdCommand(inputDataModel));

        if (!newPost) {
            throw new HttpException('Not Found', HttpStatus.NOT_FOUND)
        } else {
            return newPost
        }
    }

    @Post('blogs/:blogId/images/main')
    @UseInterceptors(FileInterceptor('file'))
    async saveMainImageForBlog(@UploadedFile(new FileValidationPipe(), new FileMainValidationPipe())
    file: Express.Multer.File,
        @Param('blogId', new PipeisValidUUID()) blogId: string,
        @Request() req: any) {
        const userId = req.userId//исправить после авторизации
        const blog: Blog | null = await this.commandBus.execute(new GetBlogDBCommand(blogId))
        
        if (!blog) {
            throw new HttpException('Not Found', HttpStatus.NOT_FOUND)
        }
        if (blog.blogger._id !== userId) {
            throw new HttpException('Forbidden', HttpStatus.FORBIDDEN);
        }
        const newMainImage: blogsImageWiewModel | null = await this.commandBus.execute(new SaveMainImageForBlogCommand(blogId, userId, file));

        if (!newMainImage) {
            throw new HttpException('Not Found SaveMainImageForBlogCommand', HttpStatus.NOT_FOUND)
        } else {
            return newMainImage
        }
    }

    @Post('blogs/:blogId/images/wallpaper')
    @UseInterceptors(FileInterceptor('file'))
    async saveWallpaperImageForBlog(@UploadedFile(new FileValidationPipe(), new FileWallpaperValidationPipe())
    file: Express.Multer.File,
        @Param('blogId', new PipeisValidUUID()) blogId: string,
        @Request() req: any) {
        const userId = req.userId//исправить после авторизации
        const blog: Blog | null = await this.commandBus.execute(new GetBlogDBCommand(blogId))
        if (!blog) {
            throw new HttpException('Not Found', HttpStatus.NOT_FOUND)
        }
        // Проверка прав доступа
        if (blog.blogger._id !== userId) {
            throw new HttpException('Forbidden', HttpStatus.FORBIDDEN);
        }
        // Сохранение изображения обоев для блога
        const newMainImage: blogsImageWiewModel | null = await this.commandBus.execute(new SaveWallpaperImageForBlogCommand(blogId, userId, file));

        if (!newMainImage) {
            throw new HttpException('Not Found', HttpStatus.NOT_FOUND)
        } else {
            return newMainImage
        }
    }

    @Post('blogs/:blogId/posts/:postId/images/main')
    @UseInterceptors(FileInterceptor('file'))
    async saveImagesForPost(@UploadedFile(new FileValidationPipe(), new PostImageValidationPipe())
    file: Express.Multer.File,
        @Param('blogId', new PipeisValidUUID()) blogId: string, @Param('postId') postId: string,
        @Request() req: any) {
        const userId = req.userId//исправить после авторизации
        const blog: Blog | null = await this.commandBus.execute(new GetBlogDBCommand(blogId))
        if (!blog) {
            throw new HttpException('Not Found', HttpStatus.NOT_FOUND)
        }
        if (blog.blogger._id !== userId) {
            throw new HttpException('Forbidden', HttpStatus.FORBIDDEN);
        }
        const post: postOutput | null = await this.commandBus.execute(new GetPostIdCommand(postId, userId))
        if (!post) {
            throw new HttpException('Not found post by id', HttpStatus.NOT_FOUND)
        }
        // Сохранение изображения для поста
        const newMainImage: postImagesViewModel | null = await this.commandBus.execute(new SaveImageForPostCommand(blogId, userId, postId, file));

        if (!newMainImage) {
            throw new HttpException('Not Found SaveImageForPostCommand', HttpStatus.NOT_FOUND)
        } else {
            return newMainImage
        }
    }


    @Put('blogs/:id')
    async updateBlog(@Param('id', new PipeisValidUUID()) blogId: string,
        @Body() blogInputData: blogInput,
        @Request() req: any) {
        const userId = req.userId//исправить после авторизации
        const blog: Blog | null = await this.commandBus.execute(new GetBlogDBCommand(blogId))
        if (!blog) {
            throw new HttpException('Not Found', HttpStatus.NOT_FOUND);
        }
        if (blog.blogger._id !== userId) {
            throw new HttpException('Forbidden', HttpStatus.FORBIDDEN);
        }

        const blogUpdate = await this.commandBus.execute(new UpdateBlogCommand(blogId, blogInputData))

        if (blogUpdate === HttpStatus.NOT_FOUND) {
            throw new HttpException('Not Found', HttpStatus.NOT_FOUND);
        } else {
            throw new HttpException('No Content', HttpStatus.NO_CONTENT)
        }
    }




    @Put('blogs/:blogId/posts/:postId')
    async updatePostByBlogId(@Param('blogId', new PipeisValidUUID()) blogId: string, @Param('postId') postId: string,
        @Body() postUpdateData: postInputModelSpecific,
        @Request() req: any) {
        const userId = req.userId//исправить после авторизации

        const blog: Blog | null = await this.commandBus.execute(new GetBlogDBCommand(blogId))
        if (!blog) {
            throw new HttpException('Not Found', HttpStatus.NOT_FOUND)
        }
        if (blog.blogger._id !== userId) {
            throw new HttpException('Forbidden', HttpStatus.FORBIDDEN);
        }
        const postResult = await this.commandBus.execute(new UpdatePostCommand(postId, postUpdateData.title,
            postUpdateData.shortDescription,
            postUpdateData.content))
        if (postResult) {
            throw new HttpException('No content', HttpStatus.NO_CONTENT)
        } else {
            throw new HttpException('Not Found', HttpStatus.NOT_FOUND)
        }

    }

    @Delete('blogs/:blogId/posts/:postId')
    async deletePostByBlogId(@Param('blogId') blogId: string, @Param('postId') postId: string,
        @Request() req: any) {
        let userId = req.userId//исправить после авторизации
        const blog: Blog | null = await this.commandBus.execute(new GetBlogDBCommand(blogId))
        if (!blog) {
            throw new HttpException('Not Found', HttpStatus.NOT_FOUND);
        }
        if (blog.blogger._id !== userId) {
            throw new HttpException('Forbidden', HttpStatus.FORBIDDEN);
        }
        let result = await this.commandBus.execute(new DeletePostIdCommand(postId))

        if (!result) {
            throw new HttpException('Not Found', HttpStatus.NOT_FOUND);
        } else {
            throw new HttpException('No Content', HttpStatus.NO_CONTENT)
        }
    }


    @Delete('blogs/:id')
    async deletBlog(@Param('id') blogId: string,
        @Request() req: any) {
        let userId = req.userId//исправить после авторизации
        const blog: Blog | null = await this.commandBus.execute(new GetBlogDBCommand(blogId))
        if (!blog) {
            throw new HttpException('Not Found', HttpStatus.NOT_FOUND);
        }
        if (blog.blogger._id !== userId) {
            throw new HttpException('Forbidden', HttpStatus.FORBIDDEN);
        }
        let result = await this.commandBus.execute(new DeleteBlogIdCommand(blogId))

        if (!result) {
            throw new HttpException('Not Found', HttpStatus.NOT_FOUND);
        } else {
            throw new HttpException('No Content', HttpStatus.NO_CONTENT)
        }
    }



}
