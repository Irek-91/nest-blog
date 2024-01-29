import { DataSource } from 'typeorm';

import { Statistic } from './quiz.pair/dv-psql/entity/statistis';
import { Pairresult } from './quiz.pair/dv-psql/entity/result.pair';
import { Pair } from './quiz.pair/dv-psql/entity/pairs';
import { Question } from './quiz.questions/db-psql/entity/question';
import { Blog } from './blogs/db-psql/entity/blog.entity';
import { Device } from './securityDevices/db-psql/entity/devices.entity';
import { EmailConfirmation } from './users/db-psql/entity/email.confirm.entity';
import { User } from './users/db-psql/entity/user.entity';
import { CustomNaimingStrategy } from './auth/strategies/naiming.strategy';
import { config } from 'dotenv';
import { Post } from './posts/db-psql/entity/post.entity';
import { Like } from './likes/entity/likes.entity';
import { Injectable } from '@nestjs/common';
import { Comment } from './comments/db-psql/entity/comments.entity';

config();

export default new DataSource ({
    type: 'postgres',
    host: process.env.PGHOSTLOCAL,
    port:  Number(process.env.PORTLOCAL),
    username: process.env.PGUSERLOCAL,
    password: process.env.PGPASSWORDLOCAL,
    database: process.env.PGDATABASELOCAL,
    synchronize: false,
    entities:[User, EmailConfirmation, Device, Post, Blog, Comment, Like, Question, Pair, Pairresult, Statistic],
    //migrations: [__dirname + '/migrations/*{.ts, .js}'],
//     migrations:{
// directory: 'src/db/migrations'
//     },
//     migrationsTableName: "custom_migration_table",
    logging: true,
    namingStrategy: new CustomNaimingStrategy()    
})

