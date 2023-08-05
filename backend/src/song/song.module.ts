import { Module } from '@nestjs/common';
import { DatabaseModule } from '../database/database.module';

import { SongController } from './song.controller';
import { SongExceptions } from './song.exceptions';
import { SongService } from './song.service';

import { Song } from './entities/song.entity';
import { Stem } from './entities/stem.entity';

@Module({
  imports: [DatabaseModule.forFeature([Song, Stem])],
  controllers: [SongController],
  providers: [SongExceptions, SongService],
})
export class SongModule {}
