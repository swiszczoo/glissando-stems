import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as nanoid from 'nanoid';

import { Config } from '../config';

import { Song } from './entities/song.entity';
import { Stem, StemStatus } from './entities/stem.entity';

interface CreateSongParams {
  bpm: number;
  title: string;
  form: { bar: number; name: string }[];
}

const NANOID_SIZE = 60;

@Injectable()
export class SongService {
  constructor(
    @InjectRepository(Song) private songRepository: Repository<Song>,
    @InjectRepository(Stem) private stemRepository: Repository<Stem>,
    private configService: ConfigService<Config>,
  ) {}

  async getAllSongsByBand(bandId: number): Promise<Song[]> {
    const songs = await this.songRepository
      .createQueryBuilder('song')
      .leftJoin('stem', 'stem', 'song.id = stem.songId')
      .addSelect('COUNT(stem.id)', 'stemCount')
      .addSelect('COALESCE(MAX(stem.samples + stem.offset), 0) AS samples')
      .where('song.ownerId = :id', { id: bandId })
      .groupBy('song.id')
      .getMany();

    return songs;
  }

  async getSongByBand(
    bandId: number,
    songId: number,
  ): Promise<Song | undefined> {
    const songs = await this.songRepository
      .createQueryBuilder('song')
      .leftJoin('stem', 'stem', 'song.id = stem.songId')
      .addSelect('COUNT(stem.id)', 'stemCount')
      .addSelect('COALESCE(MAX(stem.samples + stem.offset), 0) AS samples')
      .where('song.ownerId = :bandId AND song.id = :songId', { bandId, songId })
      .groupBy('song.id')
      .getMany();

    if (songs.length !== 1) {
      return undefined;
    } else {
      return songs[0];
    }
  }

  async getSongByBandBySlug(
    bandId: number,
    slug: string,
  ): Promise<Song | undefined> {
    const songs = await this.songRepository
      .createQueryBuilder('song')
      .leftJoin('stem', 'stem', 'song.id = stem.songId')
      .addSelect('COUNT(stem.id)', 'stemCount')
      .addSelect('COALESCE(MAX(stem.samples + stem.offset), 0) AS samples')
      .where('song.ownerId = :bandId AND song.slug = :slug', { bandId, slug })
      .groupBy('song.id')
      .getMany();

    if (songs.length !== 1) {
      return undefined;
    } else {
      return songs[0];
    }
  }

  async createSongByBand(
    bandId: number,
    params: CreateSongParams,
  ): Promise<Song> {
    const song = await this.songRepository.save({
      bpm: params.bpm,
      form: params.form,
      owner: { id: bandId },
      samples: 0,
      slug: nanoid.nanoid(NANOID_SIZE),
      title: params.title,
    });

    song.stemCount = 0;
    return song;
  }

  async deleteSongByBand(bandId: number, songId: number): Promise<number> {
    const count = (
      await this.songRepository
        .createQueryBuilder('song')
        .delete()
        .where('song.ownerId = :bandId AND song.id = :songId', {
          bandId,
          songId,
        })
        .execute()
    ).affected;

    return count;
  }

  async deleteSongByBandBySlug(bandId: number, slug: string): Promise<number> {
    const count = (
      await this.songRepository
        .createQueryBuilder('song')
        .delete()
        .where('song.ownerId = :bandId AND song.slug = :slug', { bandId, slug })
        .execute()
    ).affected;

    return count;
  }

  async getReadyStemsBySong(song: Song): Promise<Stem[]> {
    const stems = await this.stemRepository.findBy({
      songId: song.id,
      status: StemStatus.READY,
    });
    return stems;
  }

  async getStemBySongAndId(
    song: Song,
    stemId: number,
  ): Promise<Stem | undefined> {
    const stem = await this.stemRepository.findOneBy({
      songId: song.id,
      id: stemId,
    });
    return stem || undefined;
  }

  samplesToSeconds(samples: number): number {
    return samples / this.configService.get('PROJECT_SAMPLE_RATE');
  }
}
