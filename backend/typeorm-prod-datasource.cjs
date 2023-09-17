// eslint-disable-next-line @typescript-eslint/no-var-requires
const { DataSource } = require('typeorm');
require('dotenv/config');

const AppDataSource = new DataSource({
  type: 'mariadb',
  host: process.env.DATABASE_HOST || 'localhost',
  port: parseInt(process.env.DATABASE_PORT || '3306'),
  username: process.env.DATABASE_USER || 'root',
  password: process.env.DATABASE_PASSWORD || 'root',
  database: process.env.DATABASE_NAME || 'glissandostems',
  entities: ['./dist/**/*.entity{.ts,.js}'],
  migrations: ['./dist/migrations/*{.ts,.js}'],
});

module.exports = {
  AppDataSource,
};
