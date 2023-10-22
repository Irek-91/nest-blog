import { Controller, Delete, Get, HttpException, HttpStatus } from '@nestjs/common';
import { AppService } from './app.service';
import { UsersService } from './users/users.service';
import { InjectModel } from '@nestjs/mongoose';
import { User, UserDocument } from './users/models/users-schema';
import { Model } from 'mongoose';
import { Blog, BlogDocument } from './blogs/models/blogs-schema';
import { Post, PostDocument } from './posts/model/post-schema';
import { Comment, CommentDocument } from './comments/model/comments-schema';
import { Like, LikeDocument } from './likes/model/likes-schema';

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
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    @InjectModel(Blog.name) private blogModel: Model<BlogDocument>,
    @InjectModel(Post.name) private postModel: Model<PostDocument>,
    @InjectModel(Comment.name) private commentModel: Model<CommentDocument>,
    @InjectModel(Like.name) private likeModel: Model<LikeDocument>

  ) { }

  @Delete()
  async deleteAll() {
    await this.userModel.deleteMany();
    await this.blogModel.deleteMany();
    await this.postModel.deleteMany();
    await this.commentModel.deleteMany();
    await this.likeModel.deleteMany()
    throw new HttpException('Not Found', HttpStatus.NO_CONTENT)
  }
}
