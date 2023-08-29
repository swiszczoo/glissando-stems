import { Stem, StemStatus } from '../entities/stem.entity';

export class StemFailedResponseDto {
  id: number;
  name: string;
  instrument: string;
  gainDecibels: number;
  pan: number;
  offset: number;
  failed: true;

  static entityToDto(entity: Stem): StemFailedResponseDto {
    if (entity.status !== StemStatus.FAILED) {
      throw new Error('only failed stems can be converted to this dto');
    }

    return {
      id: entity.id,
      name: entity.name,
      instrument: entity.instrument,
      gainDecibels: entity.gainDecibels,
      pan: entity.pan,
      offset: entity.offset,
      failed: true,
    };
  }
}
