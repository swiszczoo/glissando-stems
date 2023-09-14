import { Module } from '@nestjs/common';
import { ConfigurableModuleClass } from './storage-s3.module-definition';

import { S3StorageService } from './storage-s3.service';

@Module({
  providers: [S3StorageService],
  exports: [S3StorageService],
})
export class S3StorageModule extends ConfigurableModuleClass {}
