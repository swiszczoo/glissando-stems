import { Stem, StemStatus } from '../entities/stem.entity';

export class StemResponseDto {
  id: number;
  name: string;
  instrument: string;
  path: string;
  samples: number;
  gainDecibels: number;
  offset: number;

  static entityToDto(entity: Stem) {
    if (entity.status !== StemStatus.READY) {
      throw new Error('only ready stems can be converted to this dto');
    }

    return {
      id: entity.id,
      name: entity.name,
      instrument: entity.instrument,
      path: entity.location,
      samples: entity.samples,
      gainDecibels: entity.gainDecibels,
      offset: entity.offset,
    };
  }
}
