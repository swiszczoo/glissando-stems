import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { MeResponseDto } from './dto/me-response.dto';
import { User } from './entities/user.entity';

import * as bcrypt from 'bcrypt';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User) private userRepository: Repository<User>,
  ) {}

  async verifyLoginAndPassword(
    login: string,
    password: string,
  ): Promise<User | undefined> {
    const account = await this.userRepository.findOne({
      where: [{ login }, { email: login }],
      relations: ['band'],
    });

    if (account == null) {
      return undefined;
    }

    const passwordValid = await bcrypt.compare(password, account.password);
    return passwordValid ? account : undefined;
  }

  getSessionExpireDate(): Date {
    const now = new Date();
    now.setDate(now.getDate() + 14);
    return now;
  }

  async getUserData(userId: number): Promise<MeResponseDto> {
    const account = await this.userRepository.findOneOrFail({
      where: { id: userId },
      relations: ['band'],
    });

    return {
      bandName: account.band.name,
      firstName: account.firstName,
      login: account.login,
      role: account.role,
    };
  }
}
