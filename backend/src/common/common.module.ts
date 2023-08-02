import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { InjectRepository } from '@nestjs/typeorm';

import { Repository } from 'typeorm';
import { TypeormStore } from 'connect-typeorm';

import { Session } from './entities/session.entity';
import { RolesGuard } from './roles.guard';

import { DatabaseModule } from '../database/database.module';

@Module({
  imports: [DatabaseModule.forFeature([Session])],
  providers: [
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    },
  ],
})
export class CommonModule {
  constructor(
    @InjectRepository(Session) private sessionRepository: Repository<Session>,
  ) {}

  public connectOrmSession(store: TypeormStore) {
    store.connect(this.sessionRepository);
  }
}
