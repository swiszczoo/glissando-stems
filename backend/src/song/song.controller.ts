import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Session,
} from '@nestjs/common';

import { SessionData } from '../session';

import { SongExceptions } from './song.exceptions';
import { SongService } from './song.service';

import { Role } from '../common/role.enum';
import { Roles } from '../common/roles.decorator';

import { SongCreateDto } from './dto/song-create.dto';
import { SongResponseDto } from './dto/song-response.dto';
import { StemResponseDto } from './dto/stem-response.dto';

@Controller('songs')
export class SongController {
  constructor(
    private exceptions: SongExceptions,
    private service: SongService,
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
  ): Promise<StemResponseDto[]> {
    const song = await this.service.getSongByBand(session.bandId, id);
    if (!song) {
      throw this.exceptions.NOT_FOUND;
    }

    const stems = await this.service.getReadyStemsBySong(song);
    return stems.map(StemResponseDto.entityToDto);
  }

  @Get(':id/stems/:stemId')
  @Roles(Role.User, Role.Admin)
  async findOneStem(
    @Session() session: SessionData,
    @Param('id', ParseIntPipe) id: number,
    @Param('stemId', ParseIntPipe) stemId: number,
  ): Promise<StemResponseDto> {
    const song = await this.service.getSongByBand(session.bandId, id);
    if (!song) {
      throw this.exceptions.NOT_FOUND;
    }

    const stem = await this.service.getReadyStemBySongAndId(song, stemId);
    if (!stem) {
      throw this.exceptions.NOT_FOUND;
    }

    return StemResponseDto.entityToDto(stem);
  }

  @Get('by-slug/:slug/stems')
  @Roles(Role.User, Role.Admin)
  async findAllStemsBySlug(
    @Session() session: SessionData,
    @Param('slug') slug: string,
  ): Promise<StemResponseDto[]> {
    const song = await this.service.getSongByBandBySlug(session.bandId, slug);
    if (!song) {
      throw this.exceptions.NOT_FOUND;
    }

    const stems = await this.service.getReadyStemsBySong(song);
    return stems.map(StemResponseDto.entityToDto);
  }

  @Get('by-slug/:slug/stems/:stemId')
  @Roles(Role.User, Role.Admin)
  async findOneStemBySlug(
    @Session() session: SessionData,
    @Param('slug') slug: string,
    @Param('stemId', ParseIntPipe) stemId: number,
  ): Promise<StemResponseDto> {
    const song = await this.service.getSongByBandBySlug(session.bandId, slug);
    if (!song) {
      throw this.exceptions.NOT_FOUND;
    }

    const stem = await this.service.getReadyStemBySongAndId(song, stemId);
    if (!stem) {
      throw this.exceptions.NOT_FOUND;
    }

    return StemResponseDto.entityToDto(stem);
  }
}
