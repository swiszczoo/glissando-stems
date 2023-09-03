import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Session,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';
import { FileFieldsInterceptor } from '@nestjs/platform-express';

import { plainToInstance } from 'class-transformer';
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
import { PatchStemRequestDto, StemRequestDto } from './dto/stem-request.dto';

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

  private validateForm(dto: SongCreateDto): void {
    if (dto.form.length === 0) return;

    let previous = dto.form[0].bar;
    for (const formElement of dto.form) {
      if (formElement.bar < previous) {
        throw this.exceptions.FORM_NOT_ASCENDING;
      }

      previous = formElement.bar;
    }
  }

  private validateTempo(dto: SongCreateDto): void {
    if (!dto.varyingTempo || dto.varyingTempo.length === 0) return;

    let previous = dto.varyingTempo[0].sample;
    for (const tempoElement of dto.varyingTempo) {
      if (tempoElement.sample < previous) {
        throw this.exceptions.TEMPO_NOT_ASCENDING;
      }

      previous = tempoElement.sample;
    }
  }

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
    this.validateForm(params);
    this.validateTempo(params);

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
      parsedBody = plainToInstance(StemRequestDto, JSON.parse(body.data));
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

  @Post(':id/stems')
  @Roles(Role.User, Role.Admin)
  @UseInterceptors(
    FileFieldsInterceptor([
      { name: 'data', maxCount: 1 },
      { name: 'stem', maxCount: 1 },
    ]),
  )
  async createStem(
    @Session() session: SessionData,
    @Param('id', ParseIntPipe) songId: number,
    @Body() body: { data?: string },
    @UploadedFiles() files: { stem?: Express.Multer.File[] },
  ): Promise<StemProcessingResponseDto> {
    const parsedBody = await this.validateCreateStemRequest(body, files);

    const song = await this.service.getSongByBand(session.bandId, songId);
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

  @Patch(':id/stems/:stemId')
  @Roles(Role.User, Role.Admin)
  async updateStem(
    @Session() session: SessionData,
    @Param('id', ParseIntPipe) songId: number,
    @Param('stemId', ParseIntPipe) stemId: number,
    @Body() params: PatchStemRequestDto,
  ): Promise<StemReadyResponseDto> {
    const song = await this.service.getSongByBand(session.bandId, songId);
    if (!song) {
      throw this.exceptions.NOT_FOUND;
    }

    const stem = await this.stemService.updateStemForSong(song, stemId, params);
    if (!stem) {
      throw this.exceptions.NOT_FOUND;
    }

    return StemReadyResponseDto.entityToDto(stem);
  }

  @Patch('by-slug/:slug/stems/:stemId')
  @Roles(Role.User, Role.Admin)
  async updateStemBySlug(
    @Session() session: SessionData,
    @Param('slug') slug: string,
    @Param('stemId', ParseIntPipe) stemId: number,
    @Body() params: PatchStemRequestDto,
  ): Promise<StemReadyResponseDto> {
    const song = await this.service.getSongByBandBySlug(session.bandId, slug);
    if (!song) {
      throw this.exceptions.NOT_FOUND;
    }

    const stem = await this.stemService.updateStemForSong(song, stemId, params);
    if (!stem) {
      throw this.exceptions.NOT_FOUND;
    }

    return StemReadyResponseDto.entityToDto(stem);
  }
  @Delete(':id/stems/:stemId')
  @Roles(Role.User, Role.Admin)
  async deleteStem(
    @Session() session: SessionData,
    @Param('id', ParseIntPipe) songId: number,
    @Param('stemId', ParseIntPipe) stemId: number,
  ): Promise<void> {
    const song = await this.service.getSongByBand(session.bandId, songId);
    if (!song) {
      throw this.exceptions.NOT_FOUND;
    }

    const count = await this.stemService.deleteStemForSong(song, stemId);
    if (!count) {
      throw this.exceptions.NOT_FOUND;
    }
  }

  @Delete('by-slug/:slug/stems/:stemId')
  @Roles(Role.User, Role.Admin)
  async deleteStemBySlug(
    @Session() session: SessionData,
    @Param('slug') slug: string,
    @Param('stemId', ParseIntPipe) stemId: number,
  ): Promise<void> {
    const song = await this.service.getSongByBandBySlug(session.bandId, slug);
    if (!song) {
      throw this.exceptions.NOT_FOUND;
    }

    const count = await this.stemService.deleteStemForSong(song, stemId);
    if (!count) {
      throw this.exceptions.NOT_FOUND;
    }
  }
}
