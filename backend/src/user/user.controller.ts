import { SessionData } from '../session';

import { Body, Get, Controller, Post, Session } from '@nestjs/common';
import { promisify } from 'util';

import { UserExceptions } from './user.exceptions';
import { UserService } from './user.service';

import { LoginParamsDto } from './dto/login-params.dto';
import { LoginResponseDto } from './dto/login-response.dto';
import { MeResponseDto } from './dto/me-response.dto';

import { Role } from 'src/common/role.enum';
import { Roles } from 'src/common/roles.decorator';

@Controller('user')
export class UserController {
  constructor(
    private exceptions: UserExceptions,
    private service: UserService,
  ) {}

  @Post('login')
  async login(
    @Body() params: LoginParamsDto,
    @Session() session: SessionData,
  ): Promise<LoginResponseDto> {
    const account = await this.service.verifyLoginAndPassword(
      params.login,
      params.password,
    );

    if (!account) {
      throw this.exceptions.INVALID_CREDENTIALS;
    }

    await promisify(session.regenerate).call(session);
    session.userId = account.id;
    session.bandId = account.band.id;
    session.role = account.role;
    session.cookie.expires = this.service.getSessionExpireDate();

    session.req.session = session;
    session.req.sessionID = session.id;

    await promisify(session.save).call(session);
    return { success: true };
  }

  @Post('logout')
  @Roles(Role.User, Role.Admin)
  async logout(@Session() session: SessionData): Promise<LoginResponseDto> {
    session.userId = null;
    session.bandId = null;
    session.role = null;

    await promisify(session.destroy).call(session);
    return { success: true };
  }

  @Get('me')
  @Roles(Role.User, Role.Admin)
  async findMe(@Session() session: SessionData): Promise<MeResponseDto> {
    try {
      return await this.service.getUserData(session.userId);
    } catch {
      throw this.exceptions.UNKNOWN_ERROR;
    }
  }
}
