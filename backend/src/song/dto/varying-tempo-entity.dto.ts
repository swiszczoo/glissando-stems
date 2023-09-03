import { IsInt, Min } from 'class-validator';

export class VaryingTempoEntityDto {
  @IsInt()
  @Min(0)
  public sample: number;

  @IsInt()
  @Min(0)
  public bar: number;

  @IsInt()
  @Min(1)
  public timeSigNum: number;
}
