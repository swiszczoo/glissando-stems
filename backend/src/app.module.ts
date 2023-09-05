import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { CommonModule } from './common/common.module';
import { DatabaseModule } from './database/database.module';
import { SongModule } from './song/song.module';
import { UserModule } from './user/user.module';

import { DEFAULT_CONFIG } from './config';
import { ServeStaticModule } from '@nestjs/serve-static';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, load: [() => DEFAULT_CONFIG] }),
    DatabaseModule.forRootAsync(),
    CommonModule,
    SongModule,
    UserModule,
    ServeStaticModule.forRootAsync({
      useFactory: () => {
        if (process.env.NODE_ENV === 'development') {
          return [
            {
              rootPath: './public_dev',
            },
          ];
        }

        return [];
      },
    }),
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
