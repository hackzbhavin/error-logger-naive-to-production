import 'dotenv/config';
import { DataSourceOptions } from 'typeorm';
import { ErrorEvent } from '../errors/errors.entity';

export const getTypeOrmConfig = (): DataSourceOptions => ({
  type: 'mysql',
  host: process.env.DB_HOST ?? 'localhost',
  port: Number(process.env.DB_PORT) || 3306,
  username: process.env.DB_USER ?? 'root',
  password: process.env.DB_PASS ?? '',
  database: process.env.DB_NAME ?? 'error_logger_naive',
  entities: [ErrorEvent],
  migrations: ['dist/migrations/*.js'],
  synchronize: true,
  migrationsRun: false,
  poolSize: 30,
});
