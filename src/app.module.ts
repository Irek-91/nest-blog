import { CommentsService } from './comments/comments.service';
import { ConfigModule } from '@nestjs/config';
import { Module } from '@nestjs/common';
import { AppController, TestingController } from './app.controller';
import { AppService } from './app.service';
import { UsersController } from './users/users.controller';
import { UsersService } from './users/users.service';
import { UsersRepository } from './users/db-mongo/users.repo';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from './users/models/users-schema';
import { BlogsController } from './blogs/blogs.controller';
import { BlogsService } from './blogs/blogs.service';
import { BlogsRepository } from './blogs/blogs.repo';
import { Blog, BlogSchema } from './blogs/models/blogs-schema';
import { env } from 'process';
import { Pagination } from './helpers/query-filter';
import { Post, PostSchema } from './posts/model/post-schema';
import { PostsController } from './posts/posts.controller';
import { PostsService } from './posts/posts.service';
import { PostRepository } from './posts/post.repo';
import { Comment, CommentSchema } from './comments/model/comments-schema';
import { CommentsRepository } from './comments/comments.repo';
import { CommentsController } from './comments/comments.controller';
import { Like, LikeSchema } from './likes/model/likes-schema';
import { UsersQueryRepository } from './users/db-mongo/users.qurey.repo';
import { AuthService } from './auth/auth.service';
import { EmailAdapter } from './application/email-adapter';
import { JwtService } from './application/jwt-service';
import { DevicesModel, DevicesModelSchema } from './securityDevices/model/device-schema';
import { SecurityDeviceServicePSQL } from './securityDevices/db-psql/securityDevice.service.PSQL';
import { AuthController } from './auth/auth.controller';
import { LocalStrategy } from './auth/strategies/local.strategy';
import { JwtStrategy } from './auth/strategies/jwt.strategy';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { BasicStrategy } from './auth/strategies/basic.strategy';
import { PostQueryRepository } from './posts/post.query.repo';
import { CommentsQueryRepository } from './comments/comments.query.repo';
import { BlogsQueryRepository } from './blogs/blogs.query.repo';
import { IsBlogIdAlreadyExistConstraint } from './blogs/models/blog.decorator';
import { IPAndURIModel, IPAndURISchema } from './securityDevices/model/IPAndURIModel';
import { SecurityDeviceController } from './securityDevices/securityDevice-controller';
import { ThrottlerModule } from '@nestjs/throttler';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersQueryRepoPSQL } from './users/db-psql/users.qurey.repo.PSQL';
import { UsersRepositoryPSQL } from './users/db-psql/users.repo.PSQL';
import { UsersSAController } from './users/users.SA.controller';
import { log } from 'console';
import { SecurityDeviceRepository } from './securityDevices/db-mongo/securityDevice.repo';
import { SecurityDeviceRepoPSQL } from './securityDevices/db-psql/securityDevice.repo.PSQL';
import { SecurityDeviceService } from './securityDevices/db-mongo/securityDevice.service';


@Module({
  imports: [
    ThrottlerModule.forRoot([
      {
        ttl: 10000,
        limit: 5,
      },
    ]),
    ConfigModule.forRoot(),
    MongooseModule.forRoot('mongodb+srv://admin:admin1@atlascluster.0x495z3.mongodb.net/BlogPlatform?retryWrites=true&w=majority'),
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
      },
      {
        name: Comment.name,
        schema: CommentSchema
      },
      {
        name: Like.name,
        schema: LikeSchema
      },
      {
        name: DevicesModel.name,
        schema: DevicesModelSchema
      },
      {
        name: IPAndURIModel.name,
        schema: IPAndURISchema
      }
    ]),
    JwtModule.register({
      secret: env.JWT_SECRET,
      signOptions: {expiresIn: 10}
    }),
    
    TypeOrmModule.forRoot({
      //useFactory: (configService: ConfigService<ConfigType>) => ({
      type: 'postgres',
      host: process.env.PGHOST,
      port: 5432,
      username: process.env.PGUSER,
      password: process.env.PGPASSWORD,
      database: process.env.PGDATABASE,
      autoLoadEntities: false,
      synchronize: false,
      logging: true,
      ssl: true,
      // connection: {
      //   options: `project=${ENDPOINT_ID}`,
      // },
      extra: {
                ssl: {
                    rejectUnauthorized: false,
                },
            },
    }),
    PassportModule
  ],
  controllers: [AppController, 
    TestingController, 
    UsersController,
    UsersSAController,
    BlogsController, 
    PostsController, 
    CommentsController,
    AuthController,
    SecurityDeviceController
  ],
  providers: [AppService,
    AuthService, 
    EmailAdapter,
    Pagination,
    JwtService, JwtStrategy, LocalStrategy, 
    BasicStrategy,
    UsersService, UsersRepository, UsersQueryRepository, UsersQueryRepoPSQL,UsersRepositoryPSQL,  
    BlogsService, BlogsRepository, BlogsQueryRepository, IsBlogIdAlreadyExistConstraint, 
    PostsService, PostRepository, PostQueryRepository,
    CommentsService, CommentsRepository,CommentsQueryRepository,
    SecurityDeviceRepository, SecurityDeviceService, SecurityDeviceServicePSQL, SecurityDeviceRepoPSQL
  ],
})
export class AppModule {}
