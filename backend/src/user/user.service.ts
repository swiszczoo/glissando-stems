import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Band } from './entities/band.entity';
import { User } from './entities/user.entity';

import * as bcrypt from 'bcrypt';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(Band) private bandRepository: Repository<Band>,
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

  async getUserData(userId: number): Promise<User> {
    return await this.userRepository.findOneOrFail({
      where: { id: userId },
      relations: ['band'],
    });
  }

  async getBandData(bandId: number): Promise<Band> {
    return await this.bandRepository.findOneOrFail({
      where: { id: bandId },
      relations: ['members'],
    });
  }
}
