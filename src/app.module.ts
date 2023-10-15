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

@Module({
  imports: [
    MongooseModule.forRoot('mongodb://localhost:27017/nest_blog'),
    MongooseModule.forFeature([
      {
        name: User.name,
        schema: UserSchema
      },
      {
        name: Blog.name,
        schema: BlogSchema
      }
    ]),
  ],
  controllers: [AppController, TestingController, UsersController, BlogsController],
  providers: [AppService, UserService, UsersRepository, BlogsService, BlogsRepository],
})
export class AppModule {}
