import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { CommonModule } from './common/common.module';
import { DatabaseModule } from './database/database.module';
import { SongModule } from './song/song.module';
import { UserModule } from './user/user.module';

import { DEFAULT_CONFIG } from './config';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, load: [() => DEFAULT_CONFIG] }),
    DatabaseModule.forRootAsync(),
    CommonModule,
    SongModule,
    UserModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
