import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class ChangePasswordRequestDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(64)
  currentPassword: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(64)
  newPassword: string;
}
