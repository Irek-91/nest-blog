import { BanUserByBloggerCommand } from './application/use-case/ban.user.by.blogger.use.case';
import { GetBlogsByBloggerCommand } from './../blogs/application/use-case/get.blogs.by.blogger.use.case';
import { Blog } from './../blogs/db-psql/entity/blog.entity';
import { PaginationUsersSa } from './../helpers/query-filter-users-SA';
import { PipeisValidUUID } from './../adapters/pipe';
import { AuthGuard } from './../auth.guard';
import { CreateUserCommand } from './application/use-case/create.user.use.case';
import { EmailOrLoginGuard, UserAuthGuard } from './../auth/guards/auth.guard';
import { BasicAuthGuard } from './../auth/guards/basic-auth.guard';
import { Pagination } from './../helpers/query-filter';
import { Body, Delete, Get, HttpException, HttpStatus, Param, Post, Query, UseGuards } from "@nestjs/common";
import { UsersService } from "./application/users.service";
import { BanUserByBloggerInputModel, CreatUserInputModel } from "./models/users-model";
import { Controller } from "@nestjs/common/decorators/core";
import { HttpCode, Put, Request } from "@nestjs/common/decorators";
import { CommandBus } from '@nestjs/cqrs';
import { DeleteUserIdCommand } from './application/use-case/delete.user.id.use.case';
import { GetBannedUsersForBlogCommand } from './application/use-case/get.banned.users.for.blog.use.case';
import { GetBlogIdCommand } from '../blogs/application/use-case/get.blog.id.use.case';
import { GetUserByIdCommand } from './application/use-case/get.user.by.id.use.case';
import { GetBlogDBCommand } from '../blogs/application/use-case/get.blog.DB.use.case';



@Controller()
export class UsersController {
    constructor(protected usersService: UsersService,
        private readonly pagination: PaginationUsersSa,
        private commandBus: CommandBus
    ) { }

    @UseGuards(BasicAuthGuard)
    @HttpCode(HttpStatus.OK)
    @Get('users')
    async getUsers(@Query()
    query: {
        banStatus: string;
        sortBy: string;
        sortDirection: string;
        pageNumber: string;
        pageSize: string;
        searchLoginTerm: string;
        searchEmailTerm: string;
    }) {
        const queryFilter = this.pagination.getPaginationFromQueryUser(query);
        return await this.usersService.findUsers(queryFilter)
    }

    @HttpCode(HttpStatus.CREATED)
    @UseGuards(BasicAuthGuard)
    @UseGuards(EmailOrLoginGuard)
    @Post('users')
    async createUser(@Body() inputModel: CreatUserInputModel) {
        const result = await this.commandBus.execute(new CreateUserCommand(inputModel))
        return result
    }

    @HttpCode(HttpStatus.NO_CONTENT)
    @UseGuards(UserAuthGuard)
    @Put('blogger/users/:id/ban')
    async banUserByBlogger(@Param('id', new PipeisValidUUID()) banUserId: string,
        @Body() updateData: BanUserByBloggerInputModel,
        @Request() req: any) {
        const bloggerId = req.userId
        const user = await this.commandBus.execute(new GetUserByIdCommand(banUserId))
        if (!user) {
            throw new HttpException('Not Found', HttpStatus.NOT_FOUND)
        }
        const blog: Blog | null = await this.commandBus.execute(new GetBlogDBCommand(updateData.blogId))
        if (!blog) {
            throw new HttpException('Not Found', HttpStatus.NOT_FOUND)
        }
        if (blog.blogger._id !== bloggerId) {
            throw new HttpException('FORBIDDEN', HttpStatus.FORBIDDEN)
        }
        const result = await this.commandBus.execute(new BanUserByBloggerCommand(banUserId, updateData))
        if (!result) {
            throw new HttpException('Not Found', HttpStatus.NOT_FOUND)
        } else {
            throw new HttpException('NO_CONTENT', HttpStatus.NO_CONTENT)

        }
    }

    @HttpCode(HttpStatus.OK)
    @UseGuards(UserAuthGuard)
    @Get('blogger/users/blog/:id')
    async getBannedUsersByBlog(@Param('id', new PipeisValidUUID()) blogId: string,
        @Request() req: any,
        @Query()
        query: {
            sortBy: string;
            sortDirection: string;
            pageNumber: string;
            pageSize: string;
            searchLoginTerm: string;
        }) {
        const queryFilter = this.pagination.getPaginationFromQueryUser(query)
        const bloggerId = req.userId
        const blog: Blog | null = await this.commandBus.execute(new GetBlogDBCommand(blogId))
        if (!blog) {
            throw new HttpException('Not Found', HttpStatus.NOT_FOUND)
        }
        if (blog.blogger._id !== bloggerId) {
            throw new HttpException('FORBIDDEN', HttpStatus.FORBIDDEN)
        }
        const res = await this.commandBus.execute(new GetBannedUsersForBlogCommand(blogId, queryFilter))
        return res
    }



    @UseGuards(BasicAuthGuard)
    @HttpCode(HttpStatus.NO_CONTENT)
    @Delete('users:id')
    async deleteUser(@Param('id') userId: string): Promise<Number> {
        const userDelete = await this.commandBus.execute(new DeleteUserIdCommand(userId))
        if (!userDelete) {
            throw new HttpException('Not Found', HttpStatus.NOT_FOUND);
        }
        else {
            throw new HttpException('Not Found', HttpStatus.NO_CONTENT);
        }

    }
}

