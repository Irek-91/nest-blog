import { BanUserByBloggerCommand } from './application/use-case/ban.user.by.blogger.use.case';
import { Blog } from './../blogs/db-psql/entity/blog.entity';
import { PaginationUsersSa } from './../helpers/query-filter-users-SA';
import { PipeisValidUUID } from '../infrastructure/adapters/pipe';
import { CreateUserCommand } from './application/use-case/create.user.use.case';
import { EmailOrLoginGuard, UserAuthGuard } from './../auth/guards/auth.guard';
import { BasicAuthGuard } from './../auth/guards/basic-auth.guard';
import {
  Body,
  Delete,
  Get,
  HttpException,
  HttpStatus,
  Param,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { UsersService } from './application/users.service';
import { userViewModel } from './models/users-model';
import { Controller } from '@nestjs/common/decorators/core';
import { HttpCode, Put, Request } from '@nestjs/common/decorators';
import { CommandBus } from '@nestjs/cqrs';
import { DeleteUserIdCommand } from './application/use-case/delete.user.id.use.case';
import { GetBannedUsersForBlogCommand } from './application/use-case/get.banned.users.for.blog.use.case';
import { GetUserByIdCommand } from './application/use-case/get.user.by.id.use.case';
import { GetBlogDBCommand } from '../blogs/application/use-case/get.blog.DB.use.case';
import { ApiQuery, ApiTags } from '@nestjs/swagger';
import { SwaggerOptions } from '../infrastructure/decorator/swagger.decorator';
import { CreatUserInputModel } from './models/create-user-input-model';
import { UsersOutputModel } from './models/users-output-model';
import { BanUserByBloggerInputModel } from './models/ban-user-by-blogger-input-model';
import { UserOutputModel } from './models/user-output-model';

@Controller()
@ApiTags('User')
export class UsersController {
  constructor(
    protected usersService: UsersService,
    private readonly pagination: PaginationUsersSa,
    private commandBus: CommandBus,
  ) {}

  @UseGuards(BasicAuthGuard)
  @HttpCode(HttpStatus.OK)
  @Get('users')
  @SwaggerOptions(
    'Get users',
    false,
    true,
    200,
    'Return information about the users',
    UsersOutputModel,
    false,
    false,
    true,
    false,
    false,
    false,
  )
  @ApiQuery({
    name: 'banStatus',
    type: String,
    required: false,
    description: `Default value: all 
    Available values : all, banned, notBanned`,
  })
  @ApiQuery({
    name: 'sortBy',
    type: String,
    required: false,
    description: 'Default value : createdAt',
  })
  @ApiQuery({
    name: 'sortDirection',
    type: String,
    required: false,
    description: `Default value: desc 
    Available values : asc, desc`,
  })
  @ApiQuery({
    name: 'pageNumber',
    type: String,
    required: false,
    description:
      'pageNumber is number of portions that should be returned\n' +
      'Default value : 1',
  })
  @ApiQuery({
    name: 'pageSize',
    type: String,
    required: false,
    description:
      'pageSize is portions size that should be returned\n' +
      'Default value : 10',
  })
  @ApiQuery({
    name: 'searchLoginTerm',
    type: String,
    required: false,
    description:
      'Search term for user Login: Login should contains this term in any position\n' +
      'Default value : null',
  })
  @ApiQuery({
    name: 'searchEmailTerm',
    type: String,
    required: false,
    description:
      'Search term for user Email: Email should contains this term in any position\n' +
      'Default value : null',
  })
  async getUsers(
    @Query()
    query: {
      banStatus: string;
      sortBy: string;
      sortDirection: string;
      pageNumber: string;
      pageSize: string;
      searchLoginTerm: string;
      searchEmailTerm: string;
    },
  ) {
    const queryFilter = this.pagination.getPaginationFromQueryUser(query);
    return await this.usersService.findUsers(queryFilter);
  }

  @HttpCode(HttpStatus.CREATED)
  @UseGuards(BasicAuthGuard)
  @UseGuards(EmailOrLoginGuard)
  @Post('users')
  @SwaggerOptions(
    'Creat user',
    false,
    true,
    201,
    'Return information about the created user',
    UserOutputModel,
    false,
    false,
    true,
    false,
    false,
    false,
  )
  async createUser(
    @Body() inputModel: CreatUserInputModel,
  ): Promise<userViewModel> {
    const result = await this.commandBus.execute(
      new CreateUserCommand(inputModel),
    );
    return result;
  }

  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(UserAuthGuard)
  @Put('blogger/users/:id/ban')
  @SwaggerOptions(
    'Blogger ban a user by id',
    true,
    false,
    204,
    'No Content',
    false,
    true,
    false,
    true,
    true,
    true,
    false,
  )
  async banUserByBlogger(
    @Param('id', new PipeisValidUUID()) banUserId: string,
    @Body() updateData: BanUserByBloggerInputModel,
    @Request() req: any,
  ) {
    const bloggerId = req.userId;
    const user = await this.commandBus.execute(
      new GetUserByIdCommand(banUserId),
    );
    if (!user) {
      throw new HttpException('Not Found', HttpStatus.NOT_FOUND);
    }
    const blog: Blog | null = await this.commandBus.execute(
      new GetBlogDBCommand(updateData.blogId),
    );
    if (!blog) {
      throw new HttpException('Not Found', HttpStatus.NOT_FOUND);
    }
    if (blog.blogger._id !== bloggerId) {
      throw new HttpException('FORBIDDEN', HttpStatus.FORBIDDEN);
    }
    const result = await this.commandBus.execute(
      new BanUserByBloggerCommand(banUserId, updateData),
    );
    if (!result) {
      throw new HttpException('Not Found', HttpStatus.NOT_FOUND);
    } else {
      throw new HttpException('NO_CONTENT', HttpStatus.NO_CONTENT);
    }
  }

  @HttpCode(HttpStatus.OK)
  @UseGuards(UserAuthGuard)
  @Get('blogger/users/blog/:id')
  @SwaggerOptions(
    'Get user',
    true,
    false,
    200,
    'Return information about the user',
    UserOutputModel,
    false,
    false,
    true,
    true,
    false,
    false,
  )
  async getBannedUsersByBlog(
    @Param('id', new PipeisValidUUID()) blogId: string,
    @Request() req: any,
    @Query()
    query: {
      sortBy: string;
      sortDirection: string;
      pageNumber: string;
      pageSize: string;
      searchLoginTerm: string;
    },
  ) {
    const queryFilter = this.pagination.getPaginationFromQueryUser(query);
    const bloggerId = req.userId;
    const blog: Blog | null = await this.commandBus.execute(
      new GetBlogDBCommand(blogId),
    );
    if (!blog) {
      throw new HttpException('Not Found', HttpStatus.NOT_FOUND);
    }
    if (blog.blogger._id !== bloggerId) {
      throw new HttpException('FORBIDDEN', HttpStatus.FORBIDDEN);
    }
    const res = await this.commandBus.execute(
      new GetBannedUsersForBlogCommand(blogId, queryFilter),
    );
    return res;
  }

  @UseGuards(BasicAuthGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  @Delete('users:id')
  async deleteUser(@Param('id') userId: string): Promise<number> {
    const userDelete = await this.commandBus.execute(
      new DeleteUserIdCommand(userId),
    );
    if (!userDelete) {
      throw new HttpException('Not Found', HttpStatus.NOT_FOUND);
    } else {
      throw new HttpException('Not Found', HttpStatus.NO_CONTENT);
    }
  }
}
