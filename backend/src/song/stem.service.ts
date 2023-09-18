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
import { S3StorageService } from '../storage-s3/storage-s3.service';

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
const S3_RETRY_COUNT = 2;

@Injectable()
export class StemService implements OnModuleInit {
  private readonly logger = new Logger(StemService.name);

  constructor(
    @InjectRepository(Stem) private stemRepository: Repository<Stem>,
    private configService: ConfigService<Config>,
    private s3Service: S3StorageService,
  ) {}

  async onModuleInit() {
    this.logger.log('Cleaning up stem service on startup');
    await this.removeOldFailedStems();
    await this.removeOldDeletedAndOrphanedStemFiles();
  }

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  private async uploadSingleFileToS3WithRetry(
    key: string,
    path: string,
    mimeType: string,
    retryCount: number,
  ): Promise<void> {
    for (let i = 0; i < retryCount; i++) {
      try {
        this.s3Service.uploadFile(path, key, mimeType);
        return;
      } catch (e) {
        if (i + 1 === retryCount) {
          throw e;
        }
        await this.delay(1000);
      }
    }
  }

  private async uploadStemToS3(
    stemName: string,
    stemPath: string,
  ): Promise<void> {
    const [normalKey, hqKey] = this.getStemLocations(stemName);
    const normalPath = `${stemPath}.oga`;
    const hqPath = `${stemPath}.flac`;

    const rmfile = promisify(rm);

    try {
      await this.uploadSingleFileToS3WithRetry(
        normalKey,
        normalPath,
        'audio/ogg',
        S3_RETRY_COUNT,
      );

      try {
        await this.uploadSingleFileToS3WithRetry(
          hqKey,
          hqPath,
          'audio/flac',
          S3_RETRY_COUNT,
        );
      } catch (e) {
        await this.s3Service.deleteFile(normalKey);
        throw e;
      }

      try {
        await rmfile(normalPath);
      } catch {}
      try {
        await rmfile(hqPath);
      } catch {}
    } catch (e) {
      try {
        await rmfile(normalPath);
      } catch {}
      try {
        await rmfile(hqPath);
      } catch {}

      throw e;
    }
  }

  private getStemLocations(stemName: string): [string, string] {
    const normalPrefix = this.s3Service.isEnabled()
      ? this.configService.get('S3_OGG_KEY_PREFIX')
      : '';

    const hqPrefix = this.s3Service.isEnabled()
      ? this.configService.get('S3_FLAC_KEY_PREFIX')
      : '';

    return [`${normalPrefix}${stemName}.oga`, `${hqPrefix}${stemName}.flac`];
  }

  private runStemConversion(
    stem: Stem,
    stemName: string,
    pathToUploadedFile: string,
  ): [string, number] {
    const stemPath = `${this.configService.get(
      'STEM_SAVE_FOLDER',
    )}/${stemName}`;

    const args = [
      'scripts/process-file.sh',
      pathToUploadedFile,
      stemPath,
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

    const handleSuccess = async (sampleCount: number, local: boolean) => {
      await this.stemRepository.update(stem.id, {
        processingHostname: null,
        processingPid: null,
        status: StemStatus.READY,
        samples: sampleCount,
        local,
      });
    };

    const process = execFile(
      '/bin/sh',
      args,
      async (error: ExecFileException, stdout: string, stderr: string) => {
        if (error) {
          await handleFail();

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

        try {
          if (this.s3Service.isEnabled()) {
            await this.uploadStemToS3(stemName, stemPath);
          }

          await handleSuccess(sampleCount, !this.s3Service.isEnabled());
        } catch (e) {
          this.logger.error('S3 file upload failed:');
          this.logger.error(e);

          await handleFail();
        }
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
    const stemName = nanoid.nanoid(NANOID_SIZE);

    const [hostname, pid] = this.runStemConversion(
      newStem,
      stemName,
      pathToUploadedFile,
    );
    newStem.status = StemStatus.PROCESSING;
    newStem.processingHostname = hostname;
    newStem.processingPid = pid;
    const [location, hqLocation] = this.getStemLocations(stemName);
    newStem.location = location;
    newStem.hqLocation = hqLocation;

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

    return (
      (await this.stemRepository.findOneBy({ id: id, songId: song.id })) ||
      undefined
    );
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
        status: StemStatus.DELETED,
      },
      {
        songId: IsNull(),
      },
    ]);

    const rmfile = promisify(rm);
    const removedIds = [];
    let removedCount = 0;

    for (const stem of stems) {
      if (stem.local) {
        const normalPath = `${this.configService.get('STEM_SAVE_FOLDER')}/${
          stem.location
        }`;
        const hqPath = `${this.configService.get('STEM_SAVE_FOLDER')}/${
          stem.hqLocation
        }`;

        try {
          await rmfile(normalPath);
          ++removedCount;
        } catch {
          this.logger.warn(`Could not remove stem data file at ${normalPath}`);
        }

        try {
          await rmfile(hqPath);
          ++removedCount;
        } catch {
          this.logger.warn(`Could not remove stem data file at ${hqPath}`);
        }

        removedIds.push(stem.id);
      } else {
        let normalSuccess = false;
        let hqSuccess = false;

        try {
          await this.s3Service.deleteFile(stem.location);
          normalSuccess = true;
          ++removedCount;
        } catch {
          this.logger.warn(
            `Could not remove stem remote data at key ${stem.location}`,
          );
        }

        try {
          await this.s3Service.deleteFile(stem.hqLocation);
          hqSuccess = true;
          ++removedCount;
        } catch {
          this.logger.warn(
            `Could not remove stem remote data at key ${stem.hqLocation}`,
          );
        }

        if (normalSuccess && hqSuccess) {
          removedIds.push(stem.id);
        }
      }
    }

    this.logger.log(
      `Storage cleanup - removed ${removedCount} stem files in total.`,
    );

    if (stems.length > 0) {
      await this.stemRepository.delete({
        id: In(removedIds),
      });
    }
  }
}
