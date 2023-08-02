import { IsNotEmpty, MaxLength } from 'class-validator';

export class LoginParamsDto {
  @IsNotEmpty()
  login: string;

  @IsNotEmpty()
  @MaxLength(64)
  password: string;
}
