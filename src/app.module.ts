import { DeleteQuestionIdUseCase } from './quiz.questions/application/use-cases/delete.question.id.use.case';
import { UpdateQuestionInPublishUseCase } from './quiz.questions/application/use-cases/update.question.in.publish';
import { UpdateQuestionIdUseCase } from './quiz.questions/application/use-cases/update.question.id.use.case';
import { CreateQuestionUseCase } from './quiz.questions/application/use-cases/create.question.use.case';
import { FindQuestionsUseCase } from './quiz.questions/application/use-cases/find.questions.use.case';
import { QuestionsRepository } from './quiz.questions/db-psql/questions.repo';
import { PairGameQueryRepo } from './quiz.pair/dv-psql/pair.game.query.repo';
import { Statistic } from './quiz.pair/dv-psql/entity/statistis';
import { CheckingActivePair } from './auth/guards/auth.guard';
import { CustomPipe } from './adapters/pipe';
import { Pairresult } from './quiz.pair/dv-psql/entity/result.pair';
import { Pair } from './quiz.pair/dv-psql/entity/pairs';
import { PairGameRepo } from './quiz.pair/dv-psql/pair.game.Repo';
import { PairGameService } from './quiz.pair/pair.game.service';
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
import { BlogsService } from './blogs/blogs.service';
import { BlogsRepository } from './blogs/db-mongo/blogs.repo';
import { env } from 'process';
import { Pagination } from './helpers/query-filter';
import { PostsController } from './posts/posts.controller';
import { PostsService } from './posts/posts.service';
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

import { UserSchema } from './users/models/users-schema';
import { EmailConfirmation } from './users/db-psql/entity/email.confirm.entity';
import { CustomNaimingStrategy } from './auth/strategies/naiming.strategy';
import { Question } from './quiz.questions/db-psql/entity/question';
import AppDataSource from './db/data-source';
import { CqrsModule } from '@nestjs/cqrs';

const questionsUseCase = [FindQuestionsUseCase, CreateQuestionUseCase, 
  UpdateQuestionIdUseCase, UpdateQuestionInPublishUseCase,
  DeleteQuestionIdUseCase]


@Module({
  imports: [CqrsModule,
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
    
    TypeOrmModule.forRoot({
      //useFactory: (configService: ConfigService<ConfigType>) => ({
      type: 'postgres',
      host: process.env.PGHOSTLOCAL,
      port:  Number(process.env.PORTLOCAL),
      username: process.env.PGUSERLOCAL,
      password: process.env.PGPASSWORDLOCAL,
      database: process.env.PGDATABASELOCAL,
      autoLoadEntities: true,
      synchronize: true,
      migrations: ['migrations/*.ts'],
      migrationsTableName: "custom_migration_table",
      logging: true,
      namingStrategy: new CustomNaimingStrategy()
      //ssl: true,
      // connection: {
      //   options: `project=${ENDPOINT_ID}`,
      // },
      // extra: {
      //           ssl: {
      //               rejectUnauthorized: false,
      //           },
      //       },
    }),
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
    BlogsController,BlogsSAController,
    PostsController, 
    CommentsController,
    AuthController,
    SecurityDeviceController,
    QusetionsSAController,
    PairGameController
  ],
  providers: [AppService,
    AuthService, 
    EmailAdapter,
    Pagination,
    JwtService, JwtStrategy, LocalStrategy, 
    BasicStrategy,
    UsersService, 
    //UsersRepository, UsersQueryRepository,
    UsersQueryRepoPSQL,UsersRepositoryPSQL,  
    BlogsService, 
    //BlogsRepository, BlogsQueryRepository, 
    IsBlogIdAlreadyExistConstraint, BlogsQueryRepoPSQL, BlogsRepoPSQL,
    PostsService, 
    //PostRepository, PostQueryRepository, 
    PostQueryRepoPSQL, PostRepoPSQL,
    CommentsService, 
    //CommentsRepository,CommentsQueryRepository,
    CommentsQueryRepoPSQL, CommentsRepoPSQL,
    //SecurityDeviceService, SecurityDeviceRepository,
    SecurityDeviceServicePSQL, SecurityDeviceRepoPSQL,
    LikesRepository,
    QusetionsService, QuestionsRepository, QuestionsQueryRepository, ...questionsUseCase,
    PairGameService, PairGameRepo,PairGameQueryRepo,
    CustomPipe,
    CheckingActivePair
  ],
})
export class AppModule {}
