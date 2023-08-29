import {
  BadRequestException,
  GoneException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

@Injectable()
export class SongExceptions {
  public NOT_FOUND = new NotFoundException('Entity not found');
  public NOT_AVAILABLE = new GoneException('This stem is no more available');
  public FILE_NOT_FOUND = new BadRequestException(
    'This multipart request should also contain a stem parameter',
  );
  public DATA_NOT_FOUND = new BadRequestException(
    'This multipart request should also contain a data parameter',
  );
}
