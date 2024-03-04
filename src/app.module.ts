import { AddTelegramIdBySubscriberUseCase } from './blogs/application/use-case/add.telegramId.for.subscriber.use.case';
import { HandleTelegramUseCase } from './integrations/use-case/handle.telegram.use.case';
import { GetLinkForSuscriberUseCase } from './users/application/use-case/get.link.for.suscriber.use.case';
import { UnsubscribeUserToBlogUseCase } from './blogs/application/use-case/unsubscribe.user.to.blog.use.case';
import { BlogSubscriber } from './blogs/db-psql/entity/subscribers.blog.entity';
import { SubscriptionUserToBlogUseCase } from './blogs/application/use-case/subscription.user.to.blog.use.case';
import { TelegramAdapter } from './adapters/telegram-adapter';
import { IntegrationsController } from './integrations/integrations.controller';
import { ImageForPost } from './posts/db-psql/entity/image.post.entity';
import { SaveImageForPostUseCase } from './posts/application/use-case/save.image.for.post.use.case';
import { SaveWallpaperImageForBlogUseCase } from './blogs/application/use-case/save.wallpaper.image.for.blog.use.case';
import { SaveMainImageForBlogUseCase } from './blogs/application/use-case/save.main.image.for.blog.use.case';
import { MainImageForBlog } from './blogs/db-psql/entity/main.image.blog.entity';
import { WallpaperImageForBlog } from './blogs/db-psql/entity/wallpaper.image.blog.entity';
import { S3StorageAdapter } from './adapters/s3-storage-adapter';
import { GetCommentsByBlogUseCase } from './comments/application/use-case/get.comments.by.blog.use.cae';
import { UpdateLikeStatusCommentUseCase } from './comments/application/use-case/update.like.status.commet.use.case';
import { FindCommentsByPostUseCase } from './comments/application/use-case/find.comments.by.post.use.case';
import { DeleteCommentByIdUseCase } from './comments/application/use-case/delete.comment.by.id.use.case';
import { GetCommentByIdUseCase } from './comments/application/use-case/get.comment.by.id.use.case';
import { UpdateCommentByPostUseCase } from './comments/application/use-case/update.comment.py.post.use.case';
import { CreatedCommentPostUseCase } from './comments/application/use-case/created.comment.by.post.use.case';
import { GetSABlogIdUseCase } from './blogs/application/use-case/get.SA.blog.id.use.';
import { UpdateBanStatusByBlogUseCase } from './blogs/application/use-case/update.ban.status.by.blog.use.case';
import { GetBannedUsersForBlogUseCase } from './users/application/use-case/get.banned.users.for.blog.use.case';
import { UsersBannedByBlogger } from './users/db-psql/entity/users.banned.by.blogger.entity';
import { BanUserByBloggerUseCase } from './users/application/use-case/ban.user.by.blogger.use.case';
import { GetBlogsByBloggerUseCase } from './blogs/application/use-case/get.blogs.by.blogger.use.case';
import { DeleteUserIdUseCase } from './users/application/use-case/delete.user.id.use.case';
import { GetUserByIdUseCase } from './users/application/use-case/get.user.by.id.use.case';
import { PaginationUsersSa } from './helpers/query-filter-users-SA';
import { UpdateStatusUserUseCase } from './users/application/use-case/update.status.user.use.case';
import { CreateUserUseCase } from './users/application/use-case/create.user.use.case';
import { BannedUser } from './users/db-psql/entity/banned.user.entity';
import { FindBlogsSAUseCase } from './blogs/application/use-case/find.blogs.SA.use.case copy';
import { BindBlogWithUserUseCase } from './blogs/application/use-case/bind.blog.with.user.use.case';
import { GetBlogDBUseCase } from './blogs/application/use-case/get.blog.DB.use.case';
import { BloggerController } from './blogs/blogger.controller';
import { DeletePostsAllUseCase } from './posts/application/use-case/delete.posts.all';
import { updateLikeStatusPostUseCase } from './posts/application/use-case/update.like.status.post.use.case';
import { CreatedPostByBlogIdUseCase } from './posts/application/use-case/created.post.by.blog.id.use.case';
import { DeletePostsByBlogIdUseCase } from './posts/application/use-case/delete.posts.by.blog.id.use.case';
import { DeletePostIdUseCase } from './posts/application/use-case/delete.post.id.use.case';
import { GetPostIdUseCase } from './posts/application/use-case/get.post.id.use.case';
import { FindPostsByBlogIdUseCase } from './posts/application/use-case/find.posts.by.blog.id.use.case';
import { FindPostsUseCase } from './posts/application/use-case/find.post.use.case';
import { FindBlogsUseCase } from './blogs/application/use-case/find.blogs.use.case';
import { GetBlogNameByIdUseCase } from './blogs/application/use-case/get.blog.name.by.id';
import { UpdateBlogUseCase } from './blogs/application/use-case/update.blog.use.case';
import { CreateBlogUseCase } from './blogs/application/use-case/create.blog.use.case';
import { PairGameRepo } from './quiz.pair/dv-psql/pair.game.repo';
import { SendAnswerUseCase } from './quiz.pair/application/use-case/send.answer.use.case';
import { ConnectUserByPairUseCase } from './quiz.pair/application/use-case/connect.user.by.pair.use.case';
import { CreateNewStatisticByPalyerUseCase } from './quiz.pair/application/use-case/create.new.statistic.by.palyer.use.case';
import { GetPairByIdUseCase } from './quiz.pair/application/use-case/get.pair.by.id';
import { GetAllPairsByUserUseCase } from './quiz.pair/application/use-case/get.all.pairs.by.user.use.case';
import { GetTopUsersUseCase } from './quiz.pair/application/use-case/get.top.users';
import { GetStatisticByUserUseCase } from './quiz.pair/application/use-case/get.statistic.by.user.use.case';
import { GetPairMyCurrentUseCase } from './quiz.pair/application/use-case/get.pair.my.current.use.case';
import { DeleteQuestionIdUseCase } from './quiz.questions/application/use-cases/delete.question.id.use.case';
import { UpdateQuestionInPublishUseCase } from './quiz.questions/application/use-cases/update.question.in.publish';
import { UpdateQuestionIdUseCase } from './quiz.questions/application/use-cases/update.question.id.use.case';
import { CreateQuestionUseCase } from './quiz.questions/application/use-cases/create.question.use.case';
import { FindQuestionsUseCase } from './quiz.questions/application/use-cases/find.questions.use.case';
import { QuestionsRepository } from './quiz.questions/db-psql/questions.repo';
import { PairGameQueryRepo } from './quiz.pair/dv-psql/pair.game.query.repo';
import { Statistic } from './quiz.pair/dv-psql/entity/statistic';
import { CheckingActivePair } from './auth/guards/auth.guard';
import { PipeisValidUUID, FileValidationPipe, FileWallpaperValidationPipe, FileMainValidationPipe, PostImageValidationPipe } from './adapters/pipe';
import { Pairresult } from './quiz.pair/dv-psql/entity/result.pair';
import { Pair } from './quiz.pair/dv-psql/entity/pairs';
import { PairGameService } from './quiz.pair/application/pair.game.service';
import { PairGameController } from './quiz.pair/pair.game.controller';
import { QuestionsQueryRepository } from './quiz.questions/db-psql/questions.query.repo';

import { QusetionsService } from './quiz.questions/application/questions.service';
import { QusetionsSAController } from './quiz.questions/questions.SA.controller';
import { Like } from './likes/entity/likes.entity';
import { Comment } from './comments/db-psql/entity/comments.entity';
import { Blog } from './blogs/db-psql/entity/blog.entity';
import { Device } from './securityDevices/db-psql/entity/devices.entity';
import { LikesRepository } from './likes/likes.repo';
import { CommentsRepoPSQL } from './comments/db-psql/comments.repo.PSQL';
import { CommentsService } from './comments/application/comments.service';
import { ConfigModule } from '@nestjs/config';
import { Module } from '@nestjs/common';
import { AppController, TestingController } from './app.controller';
import { AppService } from './app.service';
import { UsersController } from './users/users.controller';
import { UsersService } from './users/application/users.service';
import { MongooseModule } from '@nestjs/mongoose';
import { BlogsController } from './blogs/blogs.controller';
import { BlogsService } from './blogs/application/blogs.service';
import { env } from 'process';
import { Pagination } from './helpers/query-filter';
import { PostsController } from './posts/posts.controller';
import { PostsService } from './posts/application/posts.service';
import { CommentsController } from './comments/comments.controller';
import { AuthService } from './auth/auth.service';
import { EmailAdapter } from './adapters/email-adapter';
import { JwtService } from './adapters/jwt-service';
import { SecurityDeviceServicePSQL } from './securityDevices/db-psql/securityDevice.service.PSQL';
import { AuthController } from './auth/auth.controller';
import { LocalStrategy } from './auth/strategies/local.strategy';
import { JwtStrategy } from './auth/strategies/jwt.strategy';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { BasicStrategy } from './auth/strategies/basic.strategy';
import { IsBlogIdAlreadyExistConstraint } from './blogs/models/blog.decorator';
import { IPAndURIModel, IPAndURISchema } from './securityDevices/model/IPAndURIModel';
import { SecurityDeviceController } from './securityDevices/securityDevice-controller';
import { ThrottlerModule } from '@nestjs/throttler';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersQueryRepoPSQL } from './users/db-psql/users.qurey.repo.PSQL';
import { UsersRepositoryPSQL } from './users/db-psql/users.repo.PSQL';
import { UsersSAController } from './users/users.SA.controller';
import { SecurityDeviceRepoPSQL } from './securityDevices/db-psql/securityDevice.repo.PSQL';
import { BlogsQueryRepoPSQL } from './blogs/db-psql/blogs.query.repo.PSQL';
import { BlogsRepoPSQL } from './blogs/db-psql/blogs.repo.PSQL';
import { PostQueryRepoPSQL } from './posts/db-psql/post.query.repo';
import { PostRepoPSQL } from './posts/db-psql/post.repo';
import { BlogsSAController } from './blogs/blogs.SA.controller';
import { CommentsQueryRepoPSQL } from './comments/db-psql/comments.query.repo.PSQL';
import { User } from './users/db-psql/entity/user.entity';
import { Post } from './posts/db-psql/entity/post.entity';
import { EmailConfirmation } from './users/db-psql/entity/email.confirm.entity';
import { CustomNaimingStrategy } from './auth/strategies/naiming.strategy';
import { Question } from './quiz.questions/db-psql/entity/question';
import { CqrsModule } from '@nestjs/cqrs';
import { ScheduleModule } from '@nestjs/schedule';
import { DeleteBlogIdUseCase } from './blogs/application/use-case/delete.blog.id.use.case';
import { DeleteBlogsAllUseCase } from './blogs/application/use-case/delete.blogs.all.use.case';
import { GetBlogIdUseCase } from './blogs/application/use-case/get.blog.id.use.case';
import { UpdatePostUseCase } from './posts/application/use-case/update.post.use.case';

const questionsUseCase = [FindQuestionsUseCase, CreateQuestionUseCase,
  UpdateQuestionIdUseCase, UpdateQuestionInPublishUseCase,
  DeleteQuestionIdUseCase]
const pairGameUseCase = [GetPairMyCurrentUseCase, GetStatisticByUserUseCase,
  GetTopUsersUseCase, GetAllPairsByUserUseCase, GetPairByIdUseCase,
  CreateNewStatisticByPalyerUseCase, ConnectUserByPairUseCase, SendAnswerUseCase]

const blogUseCase = [FindBlogsUseCase, FindBlogsSAUseCase, CreateBlogUseCase, UpdateBlogUseCase, DeleteBlogIdUseCase,
  DeleteBlogsAllUseCase, GetBlogNameByIdUseCase, GetBlogIdUseCase, GetBlogDBUseCase, BindBlogWithUserUseCase, GetBlogsByBloggerUseCase,
  UpdateBanStatusByBlogUseCase, GetSABlogIdUseCase, SaveMainImageForBlogUseCase, SaveWallpaperImageForBlogUseCase,
  SubscriptionUserToBlogUseCase, UnsubscribeUserToBlogUseCase, GetLinkForSuscriberUseCase, AddTelegramIdBySubscriberUseCase]

const postUseCase = [FindPostsUseCase, FindPostsByBlogIdUseCase, GetPostIdUseCase, DeletePostIdUseCase,
  DeletePostsByBlogIdUseCase, CreatedPostByBlogIdUseCase, UpdatePostUseCase, updateLikeStatusPostUseCase, DeletePostsAllUseCase,
  SaveImageForPostUseCase]

const userUseCase = [CreateUserUseCase, UpdateStatusUserUseCase, GetUserByIdUseCase, DeleteUserIdUseCase,
  BanUserByBloggerUseCase, GetBannedUsersForBlogUseCase, HandleTelegramUseCase]

const commentUseCase = [CreatedCommentPostUseCase, UpdateCommentByPostUseCase, GetCommentByIdUseCase,
  DeleteCommentByIdUseCase, FindCommentsByPostUseCase, UpdateLikeStatusCommentUseCase, GetCommentsByBlogUseCase]

export const entities = [User, EmailConfirmation, Device, Post, Blog,
  Comment, Like, Question, Pair, Pairresult, Statistic, BannedUser, UsersBannedByBlogger,
  WallpaperImageForBlog, MainImageForBlog, WallpaperImageForBlog, ImageForPost, BlogSubscriber]

let { PSQL_URL } = process.env;

@Module({
  imports: [
    ScheduleModule.forRoot(),
    CqrsModule,
    ThrottlerModule.forRoot([
      {
        ttl: 10000,
        limit: 500,
      },
    ]),
    ConfigModule.forRoot(),
    //MongooseModule.forRoot('mongodb+srv://admin:admin1@atlascluster.0x495z3.mongodb.net/BlogPlatform?retryWrites=true&w=majority'),
    //MongooseModule.forFeature([
    // {
    //   name: User.name,
    //   schema: UserSchema
    // },
    // {
    //   name: Blog.name,
    //   schema: BlogSchema
    // },
    // {
    //   name: Post.name,
    //   schema: PostSchema
    // },
    // {
    //   name: Comment.name,
    //   schema: CommentSchema
    // },
    // {
    //   name: Like.name,
    //   schema: LikeSchema
    // },
    // {
    //   name: DevicesModel.name,
    //   schema: DevicesModelSchema
    // },
    // {
    //   name: IPAndURIModel.name,
    //   schema: IPAndURISchema
    // }
    //])
    //


    TypeOrmModule.forRoot(
      {
        type: 'postgres',
        host: "localhost",
        port: +process.env.PORTLOCAL!,
        username: process.env.PGUSERLOCAL,
        password: process.env.PGPASSWORDLOCAL,
        database: process.env.PGDATABASELOCAL,
        //url: process.env.PSQL_URL,
        autoLoadEntities: false,
        synchronize: true,
        entities: [...entities],
        migrations: [__dirname + '/db/migrations/*.ts'],
        migrationsTableName: "custom_migration_table",
        logging: true,
        namingStrategy: new CustomNaimingStrategy()
      }
    ),
    TypeOrmModule.forFeature([...entities])
    ,
    JwtModule.register({
      secret: env.JWT_SECRET,
      signOptions: { expiresIn: 10 }
    }),
    PassportModule
  ],


  controllers: [AppController,
    TestingController,
    UsersController, UsersSAController,
    BlogsController, BlogsSAController, BloggerController,
    PostsController,
    CommentsController,
    AuthController,
    SecurityDeviceController,
    QusetionsSAController,
    PairGameController, IntegrationsController
  ],
  providers: [AppService,
    AuthService,
    EmailAdapter, TelegramAdapter,
    Pagination, PaginationUsersSa,
    JwtService, JwtStrategy, LocalStrategy,
    BasicStrategy, S3StorageAdapter,
    UsersService, ...userUseCase,
    UsersQueryRepoPSQL, UsersRepositoryPSQL,
    BlogsService, ...blogUseCase,
    //BlogsRepository, BlogsQueryRepository, 
    IsBlogIdAlreadyExistConstraint, BlogsQueryRepoPSQL, BlogsRepoPSQL,
    PostsService, ...postUseCase,
    PostQueryRepoPSQL, PostRepoPSQL,
    CommentsService, ...commentUseCase,
    //CommentsRepository,CommentsQueryRepository,
    CommentsQueryRepoPSQL, CommentsRepoPSQL,
    //SecurityDeviceService, SecurityDeviceRepository,
    SecurityDeviceServicePSQL, SecurityDeviceRepoPSQL,
    LikesRepository,
    QusetionsService, QuestionsRepository, QuestionsQueryRepository, ...questionsUseCase,
    PairGameService, PairGameRepo, PairGameQueryRepo, ...pairGameUseCase,
    PipeisValidUUID, FileValidationPipe, FileWallpaperValidationPipe, FileMainValidationPipe, PostImageValidationPipe,
    CheckingActivePair
  ],
})
export class AppModule { }
