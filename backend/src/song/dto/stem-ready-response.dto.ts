import { Stem, StemStatus } from '../entities/stem.entity';

export class StemReadyResponseDto {
  id: number;
  name: string;
  instrument: string;
  path: string;
  losslessPath: string;
  samples: number;
  gainDecibels: number;
  pan: number;
  offset: number;

  static entityToDto(entity: Stem): StemReadyResponseDto {
    if (entity.status !== StemStatus.READY) {
      throw new Error('only ready stems can be converted to this dto');
    }

    return {
      id: entity.id,
      name: entity.name,
      instrument: entity.instrument,
      path: entity.location,
      losslessPath: entity.hqLocation,
      samples: entity.samples,
      gainDecibels: entity.gainDecibels,
      pan: entity.pan,
      offset: entity.offset,
    };
  }
}
