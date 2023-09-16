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

  public INVALID_CURRENT_PASSWORD = new UnauthorizedException(
    'Invalid current password',
  );
}
