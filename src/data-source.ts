import { entities } from './app.module';
import { DataSource } from 'typeorm';

import { CustomNaimingStrategy } from './auth/strategies/naiming.strategy';
import { config } from 'dotenv';
config();

export default new DataSource({
  type: 'postgres',
  host: process.env.PGHOSTLOCAL,
  port: Number(process.env.PORTLOCAL),
  username: process.env.PGUSERLOCAL,
  password: process.env.PGPASSWORDLOCAL,
  database: process.env.PGDATABASELOCAL,
  synchronize: false,
  entities: [...entities],
  migrations: [__dirname + '/db/migrations/*{.ts, .js}'],
  //     migrations:{
  // directory: 'src/db/migrations'
  //     },
  //     migrationsTableName: "custom_migration_table",
  logging: true,
  namingStrategy: new CustomNaimingStrategy(),
});
