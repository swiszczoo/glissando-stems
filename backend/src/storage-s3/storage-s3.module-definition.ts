import { ConfigurableModuleBuilder } from '@nestjs/common';

export interface S3StorageModuleOptions {
  enabled: boolean;
  accessKey: string;
  secretKey: string;
  endpointUrl: string;
  createBucketOnStart?: boolean;
  bucketName: string;
  forcePathStyle?: boolean;
}

export const { ConfigurableModuleClass, MODULE_OPTIONS_TOKEN } =
  new ConfigurableModuleBuilder<S3StorageModuleOptions>()
    .setClassMethodName('forRoot')
    .build();
