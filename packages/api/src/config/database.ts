import { DataSource } from 'typeorm';
import { config } from './index';

export const AppDataSource = new DataSource({
  type: 'postgres',
  url: config.database.url,
  synchronize: config.environment === 'development',
  logging: config.environment === 'development',
  entities: ['src/modules/**/entities/*.ts'],
  migrations: ['src/migrations/*.ts'],
  subscribers: [],
  ssl: config.environment === 'production' ? { rejectUnauthorized: false } : false,
});
