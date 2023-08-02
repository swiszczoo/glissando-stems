import { DynamicModule, Global, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ConfigService } from '@nestjs/config';
import { EntityClassOrSchema } from '@nestjs/typeorm/dist/interfaces/entity-class-or-schema.type';

@Global()
@Module({
  imports: [],
})
export class DatabaseModule {
  static forRootAsync(): DynamicModule {
    return TypeOrmModule.forRootAsync({
      useFactory: async (configService: ConfigService) => ({
        type: 'mysql',
        host: configService.get('DATABASE_HOST') || 'localhost',
        port: configService.get('DATABASE_PORT') || 3306,
        username: configService.get('DATABASE_USER') || 'root',
        password: configService.get('DATABASE_PASSWORD') || 'root',
        database: configService.get('DATABASE_NAME') || 'glissandostems',
        entities: [__dirname + '/../**/*.entity{.ts,.js}'],
        synchronize: configService.get('DATABASE_SYNC') || true,
      }),
      inject: [ConfigService],
    });
  }

  static forFeature(entities: EntityClassOrSchema[]): DynamicModule {
    return TypeOrmModule.forFeature(entities);
  }
}
