import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class LoginParamsDto {
  @IsString()
  @IsNotEmpty()
  login: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(64)
  password: string;
}
