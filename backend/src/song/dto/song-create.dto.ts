import {
  ArrayMinSize,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
  ValidateNested,

} from 'class-validator';

import { FormEntityDto } from './form-entity.dto';
import { VaryingTempoEntityDto } from './varying-tempo-entity.dto';

export class SongCreateDto {
  @IsNotEmpty()
  @IsString()
  @MaxLength(255)
  public title: string;

  @IsNumber({ allowInfinity: false, allowNaN: false, maxDecimalPlaces: 3 })
  @IsOptional()
  @Min(40)
  @Max(999.999)
  public bpm?: number;

  @IsInt()
  @IsOptional()
  @Min(1)
  @Max(9)
  public timeSignature?: number;

  @ValidateNested()
  public form: FormEntityDto[];

  @IsOptional()
  @ValidateNested()
  @ArrayMinSize(2)
  public varyingTempo?: VaryingTempoEntityDto[];
}
