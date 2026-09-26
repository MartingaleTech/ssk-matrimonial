import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { StorageConfig } from '../../config/storage.config';

export const PRESIGNED_PUT_EXPIRY_SECONDS = 10 * 60;
export const PRESIGNED_GET_EXPIRY_SECONDS = 15 * 60;

@Injectable()
export class StorageService {
  private readonly client: S3Client;
  private readonly bucket: string;
  private readonly publicBaseUrl: string;

  constructor(configService: ConfigService) {
    const config = configService.getOrThrow<StorageConfig>('storage');
    this.bucket = config.bucket;
    this.publicBaseUrl = config.publicBaseUrl;
    this.client = new S3Client({
      region: 'auto',
      endpoint: `https://${config.accountId}.r2.cloudflarestorage.com`,
      credentials: {
        accessKeyId: config.accessKeyId,
        secretAccessKey: config.secretAccessKey,
      },
    });
  }

  createPresignedPut(
    key: string,
    contentType: string,
    expiresInSeconds = PRESIGNED_PUT_EXPIRY_SECONDS,
  ): Promise<string> {
    return getSignedUrl(
      this.client,
      new PutObjectCommand({
        Bucket: this.bucket,
        Key: key,
        ContentType: contentType,
      }),
      { expiresIn: expiresInSeconds },
    );
  }

  createPresignedGet(
    key: string,
    expiresInSeconds = PRESIGNED_GET_EXPIRY_SECONDS,
  ): Promise<string> {
    return getSignedUrl(
      this.client,
      new GetObjectCommand({ Bucket: this.bucket, Key: key }),
      { expiresIn: expiresInSeconds },
    );
  }

  async deleteObject(key: string): Promise<void> {
    await this.client.send(
      new DeleteObjectCommand({ Bucket: this.bucket, Key: key }),
    );
  }

  getPublicUrl(key: string): string {
    return `${this.publicBaseUrl}/${key}`;
  }
}
