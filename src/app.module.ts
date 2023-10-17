import { ConfigModule } from '@nestjs/config';

import { Module } from '@nestjs/common';
import { AppController, TestingController } from './app.controller';
import { AppService } from './app.service';
import { UsersController } from './users/users.controller';
import { UserService } from './users/users.service';
import { UsersRepository } from './users/users.repository';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from './users/models/users-schema';
import { BlogsController } from './blogs/blogs.controller';
import { BlogsService } from './blogs/blogs.service';
import { BlogsRepository } from './blogs/blogs.repo';
import { Blog, BlogSchema } from './blogs/models/blogs-schema';
import * as process from 'process';
import { Pagination } from './helpers/query-filter';
import { Post, PostSchema } from './posts/model/post-schema';
import { PostsController } from './posts/posts.controller';
import { PostsService } from './posts/posts.service';
import { PostRepository } from './posts/post.repo';


@Module({
  imports: [
    ConfigModule.forRoot(),
    MongooseModule.forRoot('mongodb+srv://admin:admin1@atlascluster.0x495z3.mongodb.net/BlogPlatform?retryWrites=true&w=majority'),
      //'mongodb+srv://admin:admin1@atlascluster.0x495z3.mongodb.net/BlogPlatform?retryWrites=true&w=majority'),
    //MongooseModule.forRoot('mongodb://localhost:27017/nest_blog'),
    MongooseModule.forFeature([
      {
        name: User.name,
        schema: UserSchema
      },
      {
        name: Blog.name,
        schema: BlogSchema
      },
      {
        name: Post.name,
        schema: PostSchema
      }
    ]),
  ],
  controllers: [AppController, TestingController, UsersController, BlogsController, PostsController],
  providers: [AppService, UserService, UsersRepository, BlogsService, BlogsRepository, PostsService, PostRepository,Pagination],
})

export class AppModule {}
