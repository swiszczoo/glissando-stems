import { Song } from '../entities/song.entity';

export class SongResponseDto {
  id: number;
  slug: string;
  title: string;
  bpm: number;
  duration: number;
  samples: number;
  stemCount: number;
  form: { bar: number; name: string }[];
  varyingTempo: { sample: number; bar: number; timeSigNum: number }[];

  static entityToDto(
    samplesToSeconds: (samples: number) => number,
    entity: Song,
  ): SongResponseDto {
    return {
      id: entity.id,
      slug: entity.slug,
      title: entity.title,
      bpm: entity.bpm || null,
      duration: samplesToSeconds(entity.samples),
      samples: entity.samples,
      stemCount: entity.stemCount,
      form: entity.form,
      varyingTempo: entity.varyingTempo || null,
    };
  }
}
