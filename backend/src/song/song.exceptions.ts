import { GoneException, Injectable, NotFoundException } from '@nestjs/common';

@Injectable()
export class SongExceptions {
  public NOT_FOUND = new NotFoundException('Entity not found');
  public NOT_AVAILABLE = new GoneException('This stem is no more available');
}
