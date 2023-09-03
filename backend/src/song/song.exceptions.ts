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
  public FORM_NOT_ASCENDING = new BadRequestException(
    'Form array must be sorted by bars in ascending order',
  );
  public TEMPO_NOT_ASCENDING = new BadRequestException(
    'Varying tempo array must be sorted by sample numbers in ascending order',
  );
}
