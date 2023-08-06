import {
  IsNotEmpty,
  IsNumber,
  IsString,
  Max,
  MaxLength,
  Min,
  ValidateNested,
} from 'class-validator';

import { FormEntityDto } from './form-entity.dto';

export class SongCreateDto {
  @IsNotEmpty()
  @IsString()
  @MaxLength(255)
  public title: string;

  @IsNumber({ allowInfinity: false, allowNaN: false, maxDecimalPlaces: 3 })
  @Min(40)
  @Max(999.999)
  public bpm: number;

  @ValidateNested()
  public form: FormEntityDto[];
}
