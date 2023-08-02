import {
  Injectable,
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common';

@Injectable()
export class UserExceptions {
  public INVALID_CREDENTIALS = new UnauthorizedException(
    'Invalid login or password',
  );

  public UNKNOWN_ERROR = new InternalServerErrorException('Unknown error');
}
