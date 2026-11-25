import { randomUUID } from 'node:crypto';
import { pipeline, Readable, Transform } from 'node:stream';
import type { TransformCallback } from 'node:stream';

import {
  DeleteObjectCommand,
  GetObjectCommand,
  NoSuchKey,
  S3Client,
} from '@aws-sdk/client-s3';
import { Upload } from '@aws-sdk/lib-storage';
import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  PayloadTooLargeException,
  UnsupportedMediaTypeException,
} from '@nestjs/common';
import type { OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { AllowedFileTypeEnum } from '@shared/enums';
import type {
  IStorageObject,
  IStorageUploadInput,
  IStorageUploadResult,
} from '@shared/interfaces';

const HEADER_BYTES = 132; // DICOM magic ends at byte 132
const PART_SIZE_BYTES = 5 * 1024 * 1024;
const PART_QUEUE_SIZE = 2; // parts in flight per upload: ~10 MB memory
const PNG_MAGIC = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
const JPEG_MAGIC = Buffer.from([0xff, 0xd8, 0xff]);
const TIFF_LE_MAGIC = Buffer.from([0x49, 0x49, 0x2a, 0x00]);
const TIFF_BE_MAGIC = Buffer.from([0x4d, 0x4d, 0x00, 0x2a]);

/**
 * S3-compatible object storage (Cloudflare R2). Keys are tenant-prefixed as
 * `<organizationId>/<locationId>/<uuid>`; the client filename never enters the key.
 * Callers must verify DB ownership (RLS + CASL) before calling any method.
 */
@Injectable()
export class StorageService implements OnModuleInit, OnModuleDestroy {
  private client!: S3Client;
  private bucket!: string;
  private maxUploadBytes!: number;

  /**
   * @param config Validated application config.
   */
  constructor(private readonly config: ConfigService) {}

  /** Builds the S3 client; fails fast if any variable is missing or invalid. */
  public onModuleInit(): void {
    this.bucket = this.config.getOrThrow<string>('STORAGE_BUCKET');
    this.maxUploadBytes = Number(
      this.config.getOrThrow<string | number>('STORAGE_MAX_UPLOAD_BYTES'),
    );
    if (!Number.isInteger(this.maxUploadBytes) || this.maxUploadBytes < 1) {
      throw new Error('STORAGE_MAX_UPLOAD_BYTES must be a positive integer');
    }
    this.client = new S3Client({
      endpoint: this.config.getOrThrow<string>('STORAGE_ENDPOINT'),
      region: this.config.getOrThrow<string>('STORAGE_REGION'),
      credentials: {
        accessKeyId: this.config.getOrThrow<string>('STORAGE_ACCESS_KEY_ID'),
        secretAccessKey: this.config.getOrThrow<string>(
          'STORAGE_SECRET_ACCESS_KEY',
        ),
      },
      // R2 does not support the SDK's newer default CRC checksums.
      requestChecksumCalculation: 'WHEN_REQUIRED',
      responseChecksumValidation: 'WHEN_REQUIRED',
    });
  }

  /** Releases the client's sockets on shutdown. */
  public onModuleDestroy(): void {
    this.client.destroy();
  }

  /**
   * Streams a file to storage, enforcing the size limit and checking the real
   * file signature. Any violation aborts the multipart upload.
   * @param input Tenant ids and the file stream.
   * @returns Key, detected content type, and size; persist all three.
   */
  public async upload(
    input: IStorageUploadInput,
  ): Promise<IStorageUploadResult> {
    const key = `${input.organizationId}/${input.locationId}/${randomUUID()}`;
    let detected = undefined as AllowedFileTypeEnum | undefined;
    let sizeBytes = 0;
    let head = Buffer.alloc(0);
    const max = this.maxUploadBytes;

    const release = (callback: TransformCallback): void => {
      const type = this.detectType(head);
      if (type === null) {
        callback(new UnsupportedMediaTypeException('File type not allowed'));
        return;
      }
      const out = head;
      head = Buffer.alloc(0);
      detected = type;
      callback(null, out);
    };

    const guard = new Transform({
      transform: (chunk: Buffer, _encoding, callback): void => {
        sizeBytes += chunk.length;
        if (sizeBytes > max) {
          callback(new PayloadTooLargeException());
          return;
        }
        if (detected !== undefined) {
          callback(null, chunk);
          return;
        }
        head = Buffer.concat([head, chunk]);
        if (head.length < HEADER_BYTES) {
          callback();
          return;
        }
        release(callback);
      },
      flush: (callback): void => {
        if (detected !== undefined) {
          callback();
          return;
        }
        release(callback);
      },
    });

    // pipeline destroys `guard` if the source errors, so Upload rejects and aborts.
    pipeline(input.body, guard, (): void => undefined);

    await new Upload({
      client: this.client,
      params: {
        Bucket: this.bucket,
        Key: key,
        Body: guard,
        // Never let storage serve user bytes under a trusted type.
        ContentType: 'application/octet-stream',
      },
      partSize: PART_SIZE_BYTES,
      queueSize: PART_QUEUE_SIZE,
      leavePartsOnError: false,
    }).done();

    if (detected === undefined) {
      throw new UnsupportedMediaTypeException('File type not allowed');
    }
    return { key, contentType: detected, sizeBytes };
  }

  /**
   * Opens a download stream for an object the caller already proved ownership of.
   * @param organizationId Tenant id from the verified JWT.
   * @param locationId Location id from the authorized DB row.
   * @param key Storage key from the DB row (never from the client).
   * @returns The stream and its length.
   */
  public async download(
    organizationId: string,
    locationId: string,
    key: string,
  ): Promise<IStorageObject> {
    this.assertTenantKey(organizationId, locationId, key);
    try {
      const res = await this.client.send(
        new GetObjectCommand({ Bucket: this.bucket, Key: key }),
      );
      if (!(res.Body instanceof Readable)) {
        throw new InternalServerErrorException('Unexpected storage response');
      }
      return { body: res.Body, contentLength: res.ContentLength };
    } catch (error) {
      if (error instanceof NoSuchKey)
        throw new NotFoundException('File not found');
      throw error;
    }
  }

  /**
   * Deletes an object. Deleting a missing key is a no-op.
   * @param organizationId Tenant id from the verified JWT.
   * @param locationId Location id from the authorized DB row.
   * @param key Storage key from the DB row.
   */
  public async delete(
    organizationId: string,
    locationId: string,
    key: string,
  ): Promise<void> {
    this.assertTenantKey(organizationId, locationId, key);
    await this.client.send(
      new DeleteObjectCommand({ Bucket: this.bucket, Key: key }),
    );
  }

  /** Rejects keys outside `<org>/<location>/`. Uses 404 so key existence is not leaked. */
  private assertTenantKey(
    organizationId: string,
    locationId: string,
    key: string,
  ): void {
    if (!key.startsWith(`${organizationId}/${locationId}/`)) {
      throw new NotFoundException('File not found');
    }
  }

  /** Detects the file type from magic bytes, or null if not on the allow-list. */
  private detectType(head: Buffer): AllowedFileTypeEnum | null {
    if (head.subarray(0, 4).toString('latin1') === '%PDF')
      return AllowedFileTypeEnum.PDF;
    if (head.subarray(0, 8).equals(PNG_MAGIC)) return AllowedFileTypeEnum.PNG;
    if (head.subarray(0, 3).equals(JPEG_MAGIC)) return AllowedFileTypeEnum.JPEG;
    if (head.subarray(128, 132).toString('latin1') === 'DICM') {
      return AllowedFileTypeEnum.DICOM;
    }
    const start = head.subarray(0, 4);
    if (start.equals(TIFF_LE_MAGIC) || start.equals(TIFF_BE_MAGIC)) {
      return AllowedFileTypeEnum.TIFF;
    }
    return null;
  }
}
