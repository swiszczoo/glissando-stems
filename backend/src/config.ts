export interface Config {
  DATABASE_HOST: string;
  DATABASE_PORT: number;
  DATABASE_USER: string;
  DATABASE_PASSWORD: string;
  DATABASE_NAME: string;
  DATABASE_SYNC: boolean;
  STEM_URL_PREFIX: string;
  STEM_SAVE_FOLDER: string;
  PROJECT_SAMPLE_RATE: number;
  UPLOAD_PATH: string;
  UPLOAD_MAX_SIZE_BYTES: number;
}

export const DEFAULT_CONFIG: Config = {
  DATABASE_HOST: 'localhost',
  DATABASE_PORT: 3306,
  DATABASE_USER: 'root',
  DATABASE_PASSWORD: 'root',
  DATABASE_NAME: 'glissandostems',
  DATABASE_SYNC: true,
  STEM_URL_PREFIX: '/static/stems',
  STEM_SAVE_FOLDER: '/var/glissando/stems',
  PROJECT_SAMPLE_RATE: 44100,
  UPLOAD_PATH: './uploads',
  UPLOAD_MAX_SIZE_BYTES: 200 * 1024 * 1024, // 200 MiB
};
