import { DataSource } from 'typeorm';
import 'dotenv/config';

const AppDataSource = new DataSource({
  type: 'mariadb',
  host: process.env.DATABASE_HOST || 'localhost',
  port: parseInt(process.env.DATABASE_PORT || '3306'),
  username: process.env.DATABASE_USER || 'root',
  password: process.env.DATABASE_PASSWORD || 'root',
  database: process.env.DATABASE_NAME || 'glissandostems',
  entities: [__dirname + '/../**/*.entity{.ts,.js}'],
  migrations: ['./migrations/*{.ts,.js}'],
});

export default AppDataSource;
