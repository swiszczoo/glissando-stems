import {
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsString,
  Max,
  MaxLength,
  Min,
} from 'class-validator';
import { PartialType } from '@nestjs/mapped-types';

export class StemRequestDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  name: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(16)
  instrument: string;

  @IsInt()
  @Min(-999999)
  @Max(999999)
  offset: number;

  @IsNumber({ allowInfinity: false, allowNaN: false })
  @Min(-100)
  @Max(100)
  gainDecibels: number;

  @IsNumber({ allowInfinity: false, allowNaN: false })
  @Min(-1)
  @Max(1)
  pan: number;
}

export class PatchStemRequestDto extends PartialType(StemRequestDto) {}
