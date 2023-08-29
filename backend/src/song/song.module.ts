import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { diskStorage } from 'multer';
import * as nanoid from 'nanoid';
import * as mime from 'mime-types';
import { extname } from 'path';

import { DatabaseModule } from '../database/database.module';

import { StemService } from './stem.service';
import { SongController } from './song.controller';
import { SongExceptions } from './song.exceptions';
import { SongService } from './song.service';

import { Song } from './entities/song.entity';
import { Stem } from './entities/stem.entity';
import { MulterModule } from '@nestjs/platform-express';

import { Config } from '../config';

@Module({
  imports: [
    DatabaseModule.forFeature([Song, Stem]),
    MulterModule.registerAsync({
      inject: [ConfigService],
      useFactory: async (configService: ConfigService<Config>) => ({
        storage: diskStorage({
          destination: (req, file, cb) =>
            cb(null, configService.get('UPLOAD_PATH')),
          filename: (req, file, cb) => {
            const id = nanoid.nanoid();
            let ext = extname(file.originalname);
            if (ext.length === 0) {
              ext = `.${mime.extension(file.mimetype) || ''}`;
            }

            cb(null, `${id}${ext}`);
          },
        }),
        limits: {
          fields: 1,
          files: 1,
        },
      }),
    }),
    ScheduleModule.forRoot(),
  ],
  controllers: [SongController],
  providers: [SongExceptions, StemService, SongService],
})
export class SongModule {}
