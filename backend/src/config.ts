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
  S3_DRIVER_ENABLED: boolean;
  S3_ACCESS_KEY_ID: string;
  S3_SECRET_ACCESS_KEY: string;
  S3_BUCKET_NAME: string;
  S3_CREATE_BUCKET_ON_START: boolean;
  S3_ENDPOINT_URL: string;
  S3_REGION: string;
  S3_FORCE_PATH_STYLE: boolean;
  S3_OGG_KEY_PREFIX: string;
  S3_FLAC_KEY_PREFIX: string;
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
  S3_DRIVER_ENABLED: false,
  S3_ACCESS_KEY_ID: '',
  S3_SECRET_ACCESS_KEY: '',
  S3_BUCKET_NAME: '',
  S3_CREATE_BUCKET_ON_START: false,
  S3_ENDPOINT_URL: '',
  S3_REGION: 'not-used',
  S3_FORCE_PATH_STYLE: false,
  S3_OGG_KEY_PREFIX: '',
  S3_FLAC_KEY_PREFIX: '',
};
