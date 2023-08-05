import { Injectable, NotFoundException } from '@nestjs/common';

@Injectable()
export class SongExceptions {
  public NOT_FOUND = new NotFoundException('Entity not found');
}
