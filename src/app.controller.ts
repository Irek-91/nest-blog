import { DeletePostsAllCommand } from './posts/application/use-case/delete.posts.all';
import { QuestionsRepository } from './quiz.questions/db-psql/questions.repo';
import { PairGameRepo } from './quiz.pair/dv-psql/pair.game.repo';
import { QuestionsQueryRepository } from './quiz.questions/db-psql/questions.query.repo';
import { LikesRepository } from './likes/likes.repo';
import { CommentsService } from './comments/application/comments.service';
import { Controller, Delete, Get, HttpException, HttpStatus } from '@nestjs/common';
import { AppService } from './app.service';
import { UsersService } from './users/application/users.service';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { IPAndURIModel } from './securityDevices/model/IPAndURIModel';
import { DataSource } from 'typeorm';
import { InjectDataSource } from '@nestjs/typeorm';
import { SecurityDeviceServicePSQL } from './securityDevices/db-psql/securityDevice.service.PSQL';
import { BlogsService } from './blogs/application/blogs.service';
import { PostsService } from './posts/application/posts.service';
import { CommandBus } from '@nestjs/cqrs';
import { DeleteBlogsAllCommand } from './blogs/application/use-case/delete.blogs.all.use.case';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService,
    private readonly usersService: UsersService) { }

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }
}

@Controller('testing/all-data')
export class TestingController {
  constructor(
    private userModel: UsersService,
    private deviceModel: SecurityDeviceServicePSQL,
    private blogModel: BlogsService,
    private postModel: PostsService,
    private commentModel: CommentsService,
    private likeModel: LikesRepository,
    private questionModel: QuestionsRepository,
    private pairModel: PairGameRepo,
    private commandBus : CommandBus


    //@InjectModel(IPAndURIModel.name) private ipAndURIModel: Model<DevicesModelDocument>
  ) { }

  
  @Delete()
  async deleteAll() {
    await this.commentModel.deleteCommentsAll();
    await this.pairModel.deleteAll()
    await this.commandBus.execute(new DeletePostsAllCommand());
    await this.userModel.deleteUserAll();
    await this.commandBus.execute(new DeleteBlogsAllCommand());
    await this.questionModel.deleteAllQuestions()
    //await this.deviceModel.deleteMany();
    //await this.ipAndURIModel.deleteMany()
    console.log('Delete All')
    throw new HttpException('Not Found', HttpStatus.NO_CONTENT)
  }
}

