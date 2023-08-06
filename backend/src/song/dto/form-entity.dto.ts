import { IsInt, IsNotEmpty, IsString, MaxLength, Min } from 'class-validator';

export class FormEntityDto {
  @IsInt()
  @Min(0)
  public bar: number;

  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  public name: string;
}
