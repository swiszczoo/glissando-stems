import { DataSource } from 'typeorm';

const AppDataSource = new DataSource({
  type: 'mariadb',
  host: 'mariadb',
  port: 3306,
  username: 'root',
  password: 'root',
  database: 'glissandostems-migrations',
  entities: [__dirname + '/../**/*.entity{.ts,.js}'],
  migrations: ['./migrations/*{.ts,.js}'],
});

export default AppDataSource;
