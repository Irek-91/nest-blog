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
import { CustomPipe } from './adapters/pipe';
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
import { CommentsService } from './comments/comments.service';
import { ConfigModule } from '@nestjs/config';
import { Module} from '@nestjs/common';
import { AppController, TestingController } from './app.controller';
import { AppService } from './app.service';
import { UsersController } from './users/users.controller';
import { UsersService } from './users/users.service';
import { UsersRepository } from './users/db-mongo/users.repo';
import { MongooseModule } from '@nestjs/mongoose';
import { BlogsController } from './blogs/blogs.controller';
import { BlogsService } from './blogs/application/blogs.service';
import { BlogsRepository } from './blogs/db-mongo/blogs.repo';
import { env } from 'process';
import { Pagination } from './helpers/query-filter';
import { PostsController } from './posts/posts.controller';
import { PostsService } from './posts/application/posts.service';
import { CommentSchema } from './comments/model/comments-schema';
import { CommentsRepository } from './comments/db-mongo/comments.repo';
import { CommentsController } from './comments/comments.controller';
import { LikeSchema } from './likes/model/likes-schema';
import { UsersQueryRepository } from './users/db-mongo/users.qurey.repo';
import { AuthService } from './auth/auth.service';
import { EmailAdapter } from './adapters/email-adapter';
import { JwtService } from './adapters/jwt-service';
import { DevicesModel, DevicesModelSchema } from './securityDevices/model/device-schema';
import { SecurityDeviceServicePSQL } from './securityDevices/db-psql/securityDevice.service.PSQL';
import { AuthController } from './auth/auth.controller';
import { LocalStrategy } from './auth/strategies/local.strategy';
import { JwtStrategy } from './auth/strategies/jwt.strategy';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { BasicStrategy } from './auth/strategies/basic.strategy';
import { CommentsQueryRepository } from './comments/db-mongo/comments.query.repo';
import { BlogsQueryRepository } from './blogs/db-mongo/blogs.query.repo';
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
import { BlogsQueryRepoPSQL } from './blogs/db-psql/blogs.query.repo.PSQL';
import { BlogsRepoPSQL } from './blogs/db-psql/blogs.repo.PSQL';
import { PostQueryRepository } from './posts/db-mongo/post.query.repo';
import { PostRepository } from './posts/db-mongo/post.repo';
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

const blogUseCase = [FindBlogsUseCase, CreateBlogUseCase, UpdateBlogUseCase, DeleteBlogIdUseCase, 
  DeleteBlogsAllUseCase, GetBlogNameByIdUseCase, GetBlogIdUseCase]

const postUseCase = [FindPostsUseCase, FindPostsByBlogIdUseCase, GetPostIdUseCase, DeletePostIdUseCase,
  DeletePostsByBlogIdUseCase, CreatedPostByBlogIdUseCase, UpdatePostUseCase, updateLikeStatusPostUseCase, DeletePostsAllUseCase]


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
      //useFactory: (configService: ConfigService<ConfigType>) => ({
      type: 'postgres',
      host: process.env.PGHOSTLOCAL,
      port:  Number(process.env.PORTLOCAL),
      username: process.env.PGUSERLOCAL,
      password: process.env.PGPASSWORDLOCAL,
      database: process.env.PGDATABASELOCAL,
      autoLoadEntities: false,
      synchronize: false,
      entities:[User, EmailConfirmation, Device, Post, Blog, Comment, Like, Question, Pair, Pairresult, Statistic],
      migrations: [__dirname +'/db/migrations/*.ts'],
      migrationsTableName: "custom_migration_table",
      logging: true,
      namingStrategy: new CustomNaimingStrategy()
    }
    ),
    TypeOrmModule.forFeature([User, EmailConfirmation, Device, Post, Blog, Comment, Like, Question, Pair, Pairresult, Statistic])    
    ,
    JwtModule.register({
      secret: env.JWT_SECRET,
      signOptions: {expiresIn: 10}
    }),
    PassportModule
  ],

  
  controllers: [AppController, 
    TestingController, 
    UsersController, UsersSAController,
    BlogsController,BlogsSAController, BloggerController,
    PostsController, 
    CommentsController,
    AuthController,
    SecurityDeviceController,
    QusetionsSAController,
    PairGameController
  ],
  providers: [ AppService,
    AuthService, 
    EmailAdapter,
    Pagination,
    JwtService, JwtStrategy, LocalStrategy, 
    BasicStrategy,
    UsersService, 
    //UsersRepository, UsersQueryRepository,
    UsersQueryRepoPSQL,UsersRepositoryPSQL,  
    BlogsService, ...blogUseCase,
    //BlogsRepository, BlogsQueryRepository, 
    IsBlogIdAlreadyExistConstraint, BlogsQueryRepoPSQL, BlogsRepoPSQL,
    PostsService, ...postUseCase,
    PostQueryRepoPSQL, PostRepoPSQL,
    CommentsService, 
    //CommentsRepository,CommentsQueryRepository,
    CommentsQueryRepoPSQL, CommentsRepoPSQL,
    //SecurityDeviceService, SecurityDeviceRepository,
    SecurityDeviceServicePSQL, SecurityDeviceRepoPSQL,
    LikesRepository,
    QusetionsService, QuestionsRepository, QuestionsQueryRepository, ...questionsUseCase,
    PairGameService, PairGameRepo, PairGameQueryRepo, ...pairGameUseCase,
    CustomPipe,
    CheckingActivePair
  ],
})
export class AppModule {}
