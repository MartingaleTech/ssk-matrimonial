import 'dotenv/config';
import { DataSource } from 'typeorm';

/** CLI data source for `npm run migration:run` / `migration:revert`. */
export default new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432', 10),
  username: process.env.DB_USERNAME || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  database: process.env.DB_DATABASE || 'ssk_matrimonial',
  ssl:
    process.env.DB_SSL === 'true'
      ? {
          rejectUnauthorized:
            process.env.DB_SSL_REJECT_UNAUTHORIZED !== 'false',
          ca: process.env.DB_SSL_CA,
        }
      : false,
  entities: [__dirname + '/entities/*.entity{.ts,.js}'],
  migrations: [__dirname + '/migrations/*{.ts,.js}'],
  synchronize: false,
});
