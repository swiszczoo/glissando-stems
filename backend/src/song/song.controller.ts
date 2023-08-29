import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Session,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';
import { FileFieldsInterceptor } from '@nestjs/platform-express';

import { validateOrReject } from 'class-validator';

import { SessionData } from '../session';

import { StemService } from './stem.service';
import { SongExceptions } from './song.exceptions';
import { SongService } from './song.service';

import { Role } from '../common/role.enum';
import { Roles } from '../common/roles.decorator';

import { SongCreateDto } from './dto/song-create.dto';
import { SongResponseDto } from './dto/song-response.dto';
import { StemFailedResponseDto } from './dto/stem-failed-response.dto';
import { StemProcessingResponseDto } from './dto/stem-processing-response.dto';
import { StemReadyResponseDto } from './dto/stem-ready-response.dto';
import { StemRequestDto } from './dto/stem-request.dto';

import { StemStatus } from './entities/stem.entity';

type SingleStemDto =
  | StemFailedResponseDto
  | StemProcessingResponseDto
  | StemReadyResponseDto;

@Controller('songs')
export class SongController {
  constructor(
    private exceptions: SongExceptions,
    private service: SongService,
    private stemService: StemService,
  ) {}

  @Get()
  @Roles(Role.User, Role.Admin)
  async findAll(@Session() session: SessionData): Promise<SongResponseDto[]> {
    const songs = await this.service.getAllSongsByBand(session.bandId);

    return songs.map(
      SongResponseDto.entityToDto.bind(
        null,
        this.service.samplesToSeconds.bind(this.service),
      ),
    );
  }

  @Get(':id')
  @Roles(Role.User, Role.Admin)
  async findOne(
    @Session() session: SessionData,
    @Param('id', ParseIntPipe) id: number,
  ) {
    const song = await this.service.getSongByBand(session.bandId, id);

    if (!song) {
      throw this.exceptions.NOT_FOUND;
    }

    return SongResponseDto.entityToDto(
      this.service.samplesToSeconds.bind(this.service),
      song,
    );
  }

  @Get('by-slug/:slug')
  @Roles(Role.User, Role.Admin)
  async findOneBySlug(
    @Session() session: SessionData,
    @Param('slug') slug: string,
  ) {
    const song = await this.service.getSongByBandBySlug(session.bandId, slug);

    if (!song) {
      throw this.exceptions.NOT_FOUND;
    }

    return SongResponseDto.entityToDto(
      this.service.samplesToSeconds.bind(this.service),
      song,
    );
  }

  @Post()
  @Roles(Role.User, Role.Admin)
  async create(
    @Session() session: SessionData,
    @Body() params: SongCreateDto,
  ): Promise<SongResponseDto> {
    const song = await this.service.createSongByBand(session.bandId, params);

    return SongResponseDto.entityToDto(
      this.service.samplesToSeconds.bind(this.service),
      song,
    );
  }

  @Delete(':id')
  @Roles(Role.User, Role.Admin)
  async deleteOne(
    @Session() session: SessionData,
    @Param('id', ParseIntPipe) id: number,
  ): Promise<void> {
    const count = await this.service.deleteSongByBand(session.bandId, id);

    if (count != 1) {
      throw this.exceptions.NOT_FOUND;
    }
  }

  @Delete('by-slug/:slug')
  @Roles(Role.User, Role.Admin)
  async deleteOneBySlug(
    @Session() session: SessionData,
    @Param('slug') slug: string,
  ): Promise<void> {
    const count = await this.service.deleteSongByBandBySlug(
      session.bandId,
      slug,
    );

    if (count != 1) {
      throw this.exceptions.NOT_FOUND;
    }
  }

  @Get(':id/stems')
  @Roles(Role.User, Role.Admin)
  async findAllStems(
    @Session() session: SessionData,
    @Param('id', ParseIntPipe) id: number,
  ): Promise<StemReadyResponseDto[]> {
    const song = await this.service.getSongByBand(session.bandId, id);
    if (!song) {
      throw this.exceptions.NOT_FOUND;
    }

    const stems = await this.service.getReadyStemsBySong(song);
    return stems.map(StemReadyResponseDto.entityToDto);
  }

  @Get(':id/stems/:stemId')
  @Roles(Role.User, Role.Admin)
  async findOneStem(
    @Session() session: SessionData,
    @Param('id', ParseIntPipe) id: number,
    @Param('stemId', ParseIntPipe) stemId: number,
  ): Promise<SingleStemDto> {
    const song = await this.service.getSongByBand(session.bandId, id);
    if (!song) {
      throw this.exceptions.NOT_FOUND;
    }

    const stem = await this.service.getStemBySongAndId(song, stemId);
    if (!stem) {
      throw this.exceptions.NOT_FOUND;
    }

    switch (stem.status) {
      case StemStatus.FAILED:
        return StemFailedResponseDto.entityToDto(stem);
      case StemStatus.PROCESSING:
        return StemProcessingResponseDto.entityToDto(stem);
      case StemStatus.READY:
        return StemReadyResponseDto.entityToDto(stem);
      default:
        throw this.exceptions.NOT_AVAILABLE;
    }
  }

  @Get('by-slug/:slug/stems')
  @Roles(Role.User, Role.Admin)
  async findAllStemsBySlug(
    @Session() session: SessionData,
    @Param('slug') slug: string,
  ): Promise<StemReadyResponseDto[]> {
    const song = await this.service.getSongByBandBySlug(session.bandId, slug);
    if (!song) {
      throw this.exceptions.NOT_FOUND;
    }

    const stems = await this.service.getReadyStemsBySong(song);
    return stems.map(StemReadyResponseDto.entityToDto);
  }

  @Get('by-slug/:slug/stems/:stemId')
  @Roles(Role.User, Role.Admin)
  async findOneStemBySlug(
    @Session() session: SessionData,
    @Param('slug') slug: string,
    @Param('stemId', ParseIntPipe) stemId: number,
  ): Promise<SingleStemDto> {
    const song = await this.service.getSongByBandBySlug(session.bandId, slug);
    if (!song) {
      throw this.exceptions.NOT_FOUND;
    }

    const stem = await this.service.getStemBySongAndId(song, stemId);
    if (!stem) {
      throw this.exceptions.NOT_FOUND;
    }

    switch (stem.status) {
      case StemStatus.FAILED:
        return StemFailedResponseDto.entityToDto(stem);
      case StemStatus.PROCESSING:
        return StemProcessingResponseDto.entityToDto(stem);
      case StemStatus.READY:
        return StemReadyResponseDto.entityToDto(stem);
      default:
        throw this.exceptions.NOT_AVAILABLE;
    }
  }

  private async validateCreateStemRequest(
    body: { data?: string },
    files: { stem?: Express.Multer.File[] },
  ): Promise<StemRequestDto> {
    if (!files.stem || !files.stem[0]) {
      throw this.exceptions.FILE_NOT_FOUND;
    }
    if (!body.data) {
      throw this.exceptions.DATA_NOT_FOUND;
    }

    let parsedBody: StemRequestDto = null;
    try {
      parsedBody = JSON.parse(body.data);
    } catch (error) {
      throw new BadRequestException(error);
    }

    try {
      await validateOrReject(parsedBody);
    } catch (errors) {
      throw new BadRequestException(errors);
    }

    return parsedBody;
  }

  @Post('by-slug/:slug/stems')
  @Roles(Role.User, Role.Admin)
  @UseInterceptors(
    FileFieldsInterceptor([
      { name: 'data', maxCount: 1 },
      { name: 'stem', maxCount: 1 },
    ]),
  )
  async createStemBySlug(
    @Session() session: SessionData,
    @Param('slug') slug: string,
    @Body() body: { data?: string },
    @UploadedFiles() files: { stem?: Express.Multer.File[] },
  ): Promise<StemProcessingResponseDto> {
    const parsedBody = await this.validateCreateStemRequest(body, files);

    const song = await this.service.getSongByBandBySlug(session.bandId, slug);
    if (!song) {
      throw this.exceptions.NOT_FOUND;
    }

    return StemProcessingResponseDto.entityToDto(
      await this.stemService.uploadStemForSong(
        song,
        parsedBody,
        files.stem[0].path,
      ),
    );
  }
}
