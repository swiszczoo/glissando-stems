import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Config } from '../config';

import { Song } from './entities/song.entity';
import { Stem } from './entities/stem.entity';

export type SongWithStemCount = Song & { stemCount: number };

@Injectable()
export class SongService {
  constructor(
    @InjectRepository(Song) private songRepository: Repository<Song>,
    @InjectRepository(Stem) private stemRepository: Repository<Stem>,
    private configService: ConfigService<Config>,
  ) {}

  async getAllSongsByBand(bandId: number): Promise<SongWithStemCount[]> {
    const songs = (await this.songRepository
      .createQueryBuilder('song')
      .loadRelationCountAndMap('song.stemCount', 'song.stems')
      .where('song.ownerId = :id', { id: bandId })
      .getMany()) as SongWithStemCount[];

    return songs;
  }

  async getSongByBand(
    bandId: number,
    songId: number,
  ): Promise<SongWithStemCount | undefined> {
    const songs = (await this.songRepository
      .createQueryBuilder('song')
      .loadRelationCountAndMap('song.stemCount', 'song.stems')
      .where('song.ownerId = :bandId AND song.id = :songId', { bandId, songId })
      .getMany()) as SongWithStemCount[];

    if (songs.length !== 1) {
      return undefined;
    } else {
      return songs[0];
    }
  }

  async getSongByBandBySlug(
    bandId: number,
    slug: string,
  ): Promise<SongWithStemCount | undefined> {
    const songs = (await this.songRepository
      .createQueryBuilder('song')
      .loadRelationCountAndMap('song.stemCount', 'song.stems')
      .where('song.ownerId = :bandId AND song.slug = :slug', { bandId, slug })
      .getMany()) as SongWithStemCount[];

    if (songs.length !== 1) {
      return undefined;
    } else {
      return songs[0];
    }
  }


  samplesToSeconds(samples: number): number {
    return samples / this.configService.get('PROJECT_SAMPLE_RATE');
  }
}
