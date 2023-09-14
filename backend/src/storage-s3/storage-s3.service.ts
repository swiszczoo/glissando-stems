import { Inject, Injectable, Logger, OnModuleInit } from '@nestjs/common';
import {
  CreateBucketCommand,
  DeleteObjectCommand,
  ListBucketsCommand,
  PutBucketPolicyCommand,
  S3Client,
} from '@aws-sdk/client-s3';
import { Upload } from '@aws-sdk/lib-storage';

import * as fs from 'fs';

import {
  MODULE_OPTIONS_TOKEN,
  S3StorageModuleOptions,
} from './storage-s3.module-definition';

@Injectable()
export class S3StorageService implements OnModuleInit {
  private readonly logger = new Logger(S3StorageService.name);
  private s3: S3Client;

  constructor(
    @Inject(MODULE_OPTIONS_TOKEN) private options: S3StorageModuleOptions,
  ) {}

  private async initCreateBucket() {
    const command = new CreateBucketCommand({
      Bucket: this.options.bucketName,
      ACL: 'authenticated-read',
    });

    try {
      await this.s3.send(command);
      this.logger.log(
        `Created a new bucket called "${this.options.bucketName}"`,
      );
    } catch (e) {
      if (e.Code === 'BucketAlreadyOwnedByYou') {
        return;
      } else {
        this.logger.error('An error occured while creating a new bucket');
        this.logger.error(e);
        throw e;
      }
    }

    const policyCommand = new PutBucketPolicyCommand({
      Bucket: this.options.bucketName,
      Policy: JSON.stringify({
        Version: '2012-10-17',
        Statement: [
          {
            Effect: 'Allow',
            Principal: {
              AWS: ['*'],
            },
            Action: ['s3:GetObject'],
            Resource: [`arn:aws:s3:::${this.options.bucketName}/*`],
          },
        ],
      }),
    });

    try {
      await this.s3.send(policyCommand);
      this.logger.log('Set access policy to newly created bucket');
    } catch (e) {
      this.logger.error('An error occured while setting bucket policy');
      this.logger.error(e);
      throw e;
    }
  }

  async onModuleInit() {
    if (!this.options.enabled) {
      this.logger.log('S3 storage driver is disabled!');
      this.s3 = null;
      return;
    }

    this.s3 = new S3Client({
      credentials: {
        accessKeyId: this.options.accessKey,
        secretAccessKey: this.options.secretKey,
      },
      endpoint: this.options.endpointUrl,
      region: 'not-used',
      forcePathStyle: true,
      retryMode: 'standard',
    });

    try {
      await this.s3.send(new ListBucketsCommand({}));
    } catch (e) {
      this.logger.error('S3 driver initialization failed');
      this.logger.error(e);
      throw e;
    }

    this.logger.log('S3 driver initialization successful');

    if (this.options.createBucketOnStart) {
      await this.initCreateBucket();
    }
  }

  isEnabled(): boolean {
    return this.options.enabled && this.s3 !== null;
  }

  async uploadFile(path: string, key: string, mimeType: string): Promise<void> {
    const fstream = fs.createReadStream(path);

    const upload = new Upload({
      client: this.s3,
      params: {
        Bucket: this.options.bucketName,
        Key: key,
        Body: fstream,
        ContentType: mimeType,
        ContentDisposition: 'attachment',
      },
      leavePartsOnError: true,
    });

    try {
      await upload.done();
      fstream.close();
    } catch (e) {
      fstream.close();
      throw e;
    }
  }

  async deleteFile(key: string): Promise<boolean> {
    const command = new DeleteObjectCommand({
      Bucket: this.options.bucketName,
      Key: key,
    });

    try {
      await this.s3.send(command);
      return true;
    } catch (e) {
      this.logger.error(
        `Could not remove key "${key}" from bucket "${this.options.bucketName}"`,
      );
      this.logger.error(e);
      return false;
    }
  }
}
