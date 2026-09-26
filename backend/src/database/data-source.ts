import 'dotenv/config';
import { DataSource } from 'typeorm';
import { resolveDatabaseConnection } from '../config/database.config';

/** CLI data source for `npm run migration:run` / `migration:revert`. */
export default new DataSource({
  type: 'postgres',
  ...resolveDatabaseConnection(),
  entities: [__dirname + '/entities/*.entity{.ts,.js}'],
  migrations: [__dirname + '/migrations/*{.ts,.js}'],
  synchronize: false,
});
