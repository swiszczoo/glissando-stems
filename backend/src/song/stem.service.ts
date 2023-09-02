import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { In, IsNull, LessThan, Repository } from 'typeorm';
import * as nanoid from 'nanoid';

import { ExecFileException, execFile } from 'child_process';
import { rm } from 'fs';
import { hostname } from 'os';
import { promisify } from 'util';

import { Config } from '../config';

import { Song } from './entities/song.entity';
import { Stem, StemStatus } from './entities/stem.entity';

interface CreateStemParams {
  name: string;
  instrument: string;
  offset: number;
  gainDecibels: number;
  pan: number;
}

const NANOID_SIZE = 70;

@Injectable()
export class StemService implements OnModuleInit {
  private readonly logger = new Logger(StemService.name);

  constructor(
    @InjectRepository(Stem) private stemRepository: Repository<Stem>,
    private configService: ConfigService<Config>,
  ) {}

  async onModuleInit() {
    this.logger.log('Cleaning up stem service on startup');
    await this.removeOldFailedStems();
    await this.removeOldDeletedAndOrphanedStemFiles();
  }

  private runStemConversion(
    stem: Stem,
    pathToUploadedFile: string,
  ): [string, number] {
    const stemName = nanoid.nanoid(NANOID_SIZE);

    const args = [
      'scripts/process-file.sh',
      pathToUploadedFile,
      `${this.configService.get('STEM_SAVE_FOLDER')}/${stemName}`,
      this.configService.get('PROJECT_SAMPLE_RATE'),
    ];

    const handleFail = async () => {
      rm(pathToUploadedFile, () => {
        /* empty */
      });

      await this.stemRepository.update(stem.id, {
        processingHostname: null,
        processingPid: null,
        status: StemStatus.FAILED,
      });
    };

    const handleSuccess = async (sampleCount: number) => {
      await this.stemRepository.update(stem.id, {
        processingHostname: null,
        processingPid: null,
        status: StemStatus.READY,
        location: `${stemName}.oga`,
        hqLocation: `${stemName}.flac`,
        samples: sampleCount,
      });
    };

    const process = execFile(
      '/bin/sh',
      args,
      (error: ExecFileException, stdout: string, stderr: string) => {
        if (error) {
          handleFail();

          if (error.code) {
            this.logger.error(
              `Stem conversion failed with error code ${
                error.code
              }:\n${stderr.trim()}`,
            );
          }
          return;
        }

        const sampleCount = parseInt(stdout.trim());
        handleSuccess(sampleCount);
      },
    );

    return [hostname(), process.pid];
  }

  async uploadStemForSong(
    song: Song,
    stemInfo: CreateStemParams,
    pathToUploadedFile: string,
  ): Promise<Stem> {
    const stem = await this.stemRepository.create({
      songId: song.id,
      name: stemInfo.name,
      instrument: stemInfo.instrument,
      offset: stemInfo.offset,
      gainDecibels: stemInfo.gainDecibels,
      pan: stemInfo.pan,
      sampleRate: this.configService.get('PROJECT_SAMPLE_RATE'),
      local: true,
      status: StemStatus.RESERVED,
    });

    const newStem = await this.stemRepository.save(stem);

    const [hostname, pid] = this.runStemConversion(newStem, pathToUploadedFile);
    newStem.status = StemStatus.PROCESSING;
    newStem.processingHostname = hostname;
    newStem.processingPid = pid;

    await this.stemRepository.save(newStem);

    return newStem;
  }

  async updateStemForSong(
    song: Song,
    id: number,
    newStemInfo: Partial<CreateStemParams>,
  ): Promise<Stem | undefined> {
    await this.stemRepository.update(
      {
        id: id,
        songId: song.id,
        status: StemStatus.READY,
      },
      {
        name: newStemInfo.name,
        instrument: newStemInfo.instrument,
        offset: newStemInfo.offset,
        gainDecibels: newStemInfo.gainDecibels,
        pan: newStemInfo.pan,
      },
    );

    return (await this.stemRepository.findOneBy({ id: id })) || undefined;
  }

  async deleteStemForSong(song: Song, id: number): Promise<number> {
    const result = await this.stemRepository.update(
      {
        id: id,
        songId: song.id,
        status: StemStatus.READY,
      },
      {
        status: StemStatus.DELETED,
      },
    );

    return result.affected;
  }

  //
  //
  // Cron tasks
  //
  //

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async removeOldFailedStems() {
    const olderThan = new Date(Date.now() - 24 * 60 * 60 * 1000); // yesterday

    await this.stemRepository.delete({
      status: StemStatus.FAILED,
      createdAt: LessThan(olderThan),
    });
  }

  @Cron(CronExpression.EVERY_DAY_AT_NOON)
  async removeOldDeletedAndOrphanedStemFiles() {
    const stems = await this.stemRepository.findBy([
      {
        local: true,
        status: StemStatus.DELETED,
      },
      {
        songId: IsNull(),
      },
    ]);

    const rmfile = promisify(rm);

    for (const stem of stems) {
      const normalPath = `${this.configService.get('STEM_SAVE_FOLDER')}/${
        stem.location
      }`;
      const hqPath = `${this.configService.get('STEM_SAVE_FOLDER')}/${
        stem.hqLocation
      }`;

      try {
        await rmfile(normalPath);
      } catch {
        this.logger.warn(`Could not remove stem data file at ${normalPath}`);
      }

      try {
        await rmfile(hqPath);
      } catch {
        this.logger.warn(`Could not remove stem data file at ${hqPath}`);
      }
    }

    if (stems.length > 0) {
      await this.stemRepository.delete({
        id: In(stems.map((stem) => stem.id)),
      });
    }
  }
}
