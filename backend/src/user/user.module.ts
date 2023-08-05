import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DatabaseModule } from '../database/database.module';

import { UserExceptions } from './user.exceptions';
import { UserController } from './user.controller';
import { UserService } from './user.service';

import { Band } from './entities/band.entity';
import { User } from './entities/user.entity';

@Module({
  imports: [ConfigModule, DatabaseModule.forFeature([Band, User])],
  controllers: [UserController],
  providers: [UserExceptions, UserService],
})
export class UserModule {}
