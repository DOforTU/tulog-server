import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { User } from '../user/user.entity';

export const databaseConfig: TypeOrmModuleOptions = {
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432', 10),
  username: process.env.DB_USERNAME || 'postgres',
  password: process.env.DB_PASSWORD || 'password',
  database: process.env.DB_DATABASE || 'tulog_db',
  schema: process.env.DB_SCHEMA || 'public',
  entities: [User],
  synchronize: process.env.NODE_ENV === 'development',
  logging: process.env.NODE_ENV === 'development',
  dropSchema: false,
  migrations: [__dirname + '/migrations/**/*{.ts,.js}'],
};
