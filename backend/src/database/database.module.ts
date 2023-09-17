import { DynamicModule, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ConfigService } from '@nestjs/config';
import { EntityClassOrSchema } from '@nestjs/typeorm/dist/interfaces/entity-class-or-schema.type';

import { Config } from '../config';
import '../virtual-column-polyfill';

@Module({
  imports: [],
})
export class DatabaseModule {
  static forRootAsync(): DynamicModule {
    return TypeOrmModule.forRootAsync({
      useFactory: async (configService: ConfigService<Config>) => ({
        type: 'mariadb',
        host: configService.get('DATABASE_HOST'),
        port: configService.get('DATABASE_PORT'),
        username: configService.get('DATABASE_USER'),
        password: configService.get('DATABASE_PASSWORD'),
        database: configService.get('DATABASE_NAME'),
        entities: [__dirname + '/../**/*.entity{.ts,.js}'],
        synchronize: configService.get('DATABASE_SYNC') === 'true',
        logging:
          process.env.NODE_ENV !== 'production'
            ? ['query', 'info', 'warn', 'error']
            : ['warn', 'error'],
      }),
      inject: [ConfigService],
    });
  }

  static forFeature(entities: EntityClassOrSchema[]): DynamicModule {
    return TypeOrmModule.forFeature(entities);
  }
}
