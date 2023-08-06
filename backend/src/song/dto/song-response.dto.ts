import { SongWithStemCount } from '../song.service';

export class SongResponseDto {
  id: number;
  slug: string;
  title: string;
  bpm: number;
  duration: number;
  stemCount: number;
  form: { bar: number; name: string }[];

  static entityToDto(
    samplesToSeconds: (samples: number) => number,
    entity: SongWithStemCount,
  ) {
    return {
      id: entity.id,
      slug: entity.slug,
      title: entity.title,
      bpm: entity.bpm,
      duration: samplesToSeconds(entity.samples),
      stemCount: entity.stemCount,
      form: entity.form,
    };
  }
}