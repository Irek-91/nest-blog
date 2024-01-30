import { blogInput } from './models/blogs-model';
import { CreateBlogCommand } from './application/use-case/create.blog.use.case';
import { UserAuthGuard } from './../auth/guards/auth.guard';
import { CommandBus } from '@nestjs/cqrs';
import { Pagination } from './../helpers/query-filter';
import { PostsService } from './../posts/application/posts.service';
import { BlogsService } from './application/blogs.service';
import { Body, Controller, Post, Request, UseGuards } from "@nestjs/common";


@UseGuards(UserAuthGuard)
@Controller('blogger/blogs')
export class BloggerController {
    constructor(protected blogsService: BlogsService,
        protected postsService: PostsService,
        private readonly pagination: Pagination,
        private commandBus: CommandBus
    ) {
    }

    
    @Post()
    async createBlogByBlogger(@Body() blogInputData: blogInput,
    @Request() req: any) {
        const userId = req.userId
        const blog = await this.commandBus.execute(new CreateBlogCommand(blogInputData, userId))
        return blog
    }

}
