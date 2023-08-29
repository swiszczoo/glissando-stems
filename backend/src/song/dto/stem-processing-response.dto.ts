import { Stem, StemStatus } from '../entities/stem.entity';

export class StemProcessingResponseDto {
  id: number;
  name: string;
  instrument: string;
  gainDecibels: number;
  pan: number;
  offset: number;
  processing: true;

  static entityToDto(entity: Stem): StemProcessingResponseDto {
    if (entity.status !== StemStatus.PROCESSING) {
      throw new Error('only processing stems can be converted to this dto');
    }

    return {
      id: entity.id,
      name: entity.name,
      instrument: entity.instrument,
      gainDecibels: entity.gainDecibels,
      pan: entity.pan,
      offset: entity.offset,
      processing: true,
    };
  }
}
