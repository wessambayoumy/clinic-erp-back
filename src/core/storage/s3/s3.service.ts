import { randomUUID } from 'node:crypto';
import { pipeline, Readable } from 'node:stream';

import { DeleteObjectCommand, GetObjectCommand, NoSuchKey, S3Client, ServerSideEncryption } from '@aws-sdk/client-s3';
import { Upload } from '@aws-sdk/lib-storage';
import {
  HttpException,
  Inject,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
  UnsupportedMediaTypeException,
} from '@nestjs/common';
import type { OnModuleDestroy } from '@nestjs/common';
import { isUUID } from 'class-validator';

import {
  MIME_EXTENSIONS,
  S3_CLIENT,
  S3_FALLBACK_MIME_TYPE,
  S3_MAX_FILENAME_LENGTH,
  S3_ORIGINAL_FILENAME_METADATA_KEY,
  S3_PART_SIZE_BYTES,
  S3_UPLOAD_QUEUE_SIZE,
} from '@shared/constants/storage';
import { AllowedMimeTypeEnum } from '@shared/enums/storage';
import type { StorageFolderEnum } from '@shared/enums/storage';

import type {
  IS3DownloadResult,
  IUploadedFile,
  IUploadFileOptions,
} from '@shared/interfaces/storage';
import { ConfigService } from '@nestjs/config';
import { UploadGuardTransform } from '@/common/guards/stream/stream.guard';
import { ConfigConsts } from '@/config/config.consts';    

/**
 * Streams files through the API to S3 (no presigned URLs).
 *
 * Uploads are streamed with multipart upload, so memory stays bounded
 * regardless of file size. Every object key is namespaced by organization,
 * and every read/delete re-checks that namespace, because Postgres RLS does
 * not protect S3.
 */
@Injectable()
export class S3Service implements OnModuleDestroy {
  private readonly logger = new Logger(S3Service.name);

  /**
   * @param client - Shared S3 client.
   * @param config - Resolved S3 configuration.
   */
  public constructor(
    @Inject(S3_CLIENT) private readonly client: S3Client,
    private readonly config: ConfigService,
  ) {}

  /**
   * Releases the client's sockets on shutdown.
   */
  public onModuleDestroy(): void {
    this.client.destroy();
  }

  /**
   * Validates and streams a file to S3.
   *
   * @param options - Stream, tenant, folder and declared file metadata.
   * @returns The stored object's key and metadata.
   * @throws UnsupportedMediaTypeException when the type is not allowed or the content does not match it.
   * @throws PayloadTooLargeException when the file exceeds the size ceiling.
   * @throws BadRequestException when the file is empty.
   * @throws InternalServerErrorException when the organization id is not a UUID (a server-side bug, since it comes from the verified JWT).
   */
  public async upload(options: IUploadFileOptions): Promise<IUploadedFile> {
    this.assertValidOrganizationId(options.organizationId);

    const mimeType = this.resolveMimeType(options);
    const key = this.buildKey(options.organizationId, options.folder, mimeType);
    const guard = new UploadGuardTransform({
      mimeType,
      maxSizeBytes: options.maxSizeBytes ?? this.config.getOrThrow<number>(ConfigConsts.s3.maxUploadBytes),
    });

    // pipeline() propagates source errors (e.g. client abort) into the guard, which fails the upload.
    pipeline(options.stream, guard, (error) => {
      if (error) {
        this.logger.debug(`Upload stream ended with error: ${error.message}`);
      }
    });

    const upload = new Upload({
      client: this.client,
      queueSize: S3_UPLOAD_QUEUE_SIZE,
      partSize: S3_PART_SIZE_BYTES,
      leavePartsOnError: false,
      params: {
        Bucket: this.config.getOrThrow<string>(ConfigConsts.s3.bucket),
        Key: key,
        Body: guard,
        ContentType: mimeType,
        ServerSideEncryption: ServerSideEncryption.AES256,
        Metadata: {
          [S3_ORIGINAL_FILENAME_METADATA_KEY]: this.encodeFilename(options.originalFilename),
        },
      },
    });

    try {
      const result = await upload.done();

      return {
        key,
        bucket: this.config.getOrThrow<string>(ConfigConsts.s3.bucket),
        size: guard.totalBytes,
        mimeType,
        originalFilename: options.originalFilename,
        etag: 'ETag' in result ? result.ETag : undefined,
      };
    } catch (error: unknown) {
      throw this.toHttpException(error, 'File upload failed');
    }
  }

  /**
   * Opens a file for streaming download.
   *
   * @param organizationId - Tenant making the request.
   * @param key - Object key previously returned by `upload`.
   * @returns The body stream with its content type, size and original filename.
   * @throws NotFoundException when the object does not exist or belongs to another tenant.
   */
  public async download(organizationId: string, key: string): Promise<IS3DownloadResult> {
    this.assertKeyBelongsToTenant(organizationId, key);

    try {
      const response = await this.client.send(new GetObjectCommand({ Bucket: this.config.getOrThrow<string>(ConfigConsts.s3.bucket), Key: key }));

      if (!(response.Body instanceof Readable)) {
        throw new InternalServerErrorException('Unexpected S3 response body');
      }

      const encodedFilename = response.Metadata?.[S3_ORIGINAL_FILENAME_METADATA_KEY];

      return {
        stream: response.Body,
        mimeType: response.ContentType ?? S3_FALLBACK_MIME_TYPE,
        size: response.ContentLength,
        originalFilename: encodedFilename === undefined ? undefined : this.decodeFilename(encodedFilename),
      };
    } catch (error: unknown) {
      if (error instanceof NoSuchKey) {
        throw new NotFoundException('File not found');
      }

      throw this.toHttpException(error, 'File download failed');
    }
  }

  /**
   * Deletes a file. S3 deletes are idempotent, so a missing object is not an error.
   *
   * @param organizationId - Tenant making the request.
   * @param key - Object key previously returned by `upload`.
   * @throws NotFoundException when the key belongs to another tenant.
   */
  public async delete(organizationId: string, key: string): Promise<void> {
    this.assertKeyBelongsToTenant(organizationId, key);

    try {
      await this.client.send(new DeleteObjectCommand({ Bucket: this.config.getOrThrow<string>(ConfigConsts.s3.bucket), Key: key }));
    } catch (error: unknown) {
      throw this.toHttpException(error, 'File deletion failed');
    }
  }

  /**
   * Checks the declared MIME type against the global and per-call allow-lists.
   *
   * @param options - Upload options.
   * @returns The matching enum member.
   */
  private resolveMimeType(options: IUploadFileOptions): AllowedMimeTypeEnum {
    const declared = options.mimeType.toLowerCase();
    const allowed = options.allowedMimeTypes ?? Object.values(AllowedMimeTypeEnum);
    const match = allowed.find((candidate) => candidate === declared);

    if (match === undefined) {
      throw new UnsupportedMediaTypeException('File type is not allowed');
    }

    return match;
  }

  /**
   * Builds `<organizationId>/<folder>/<yyyy>/<mm>/<uuid>.<ext>`.
   * The extension comes from the verified MIME type, never from the client filename.
   *
   * @param organizationId - Tenant id.
   * @param folder - Logical folder.
   * @param mimeType - Verified MIME type.
   * @returns The object key.
   */
  private buildKey(organizationId: string, folder: StorageFolderEnum, mimeType: AllowedMimeTypeEnum): string {
    const now = new Date();
    const year = String(now.getUTCFullYear());
    const month = String(now.getUTCMonth() + 1).padStart(2, '0');
    const extension = MIME_EXTENSIONS.get(mimeType) ?? 'bin';

    return [organizationId, folder, year, month, `${randomUUID()}.${extension}`].join('/');
  }

  /**
   * Ensures the organization id is a UUID so it cannot inject key separators.
   *
   * @param organizationId - Tenant id.
   */
  private assertValidOrganizationId(organizationId: string): void {
    if (!isUUID(organizationId)) {
      throw new InternalServerErrorException('Invalid organization id');
    }
  }

  /**
   * Rejects keys outside the caller's tenant namespace. Responds 404 rather than 403
   * so other tenants' object keys cannot be probed.
   *
   * @param organizationId - Tenant making the request.
   * @param key - Object key to check.
   */
  private assertKeyBelongsToTenant(organizationId: string, key: string): void {
    this.assertValidOrganizationId(organizationId);

    if (!key.startsWith(`${organizationId}/`) || key.includes('..')) {
      throw new NotFoundException('File not found');
    }
  }

  /**
   * Encodes the filename for S3 user metadata, which must be ASCII.
   *
   * @param filename - Client-supplied filename.
   * @returns base64url of the (truncated) filename.
   */
  private encodeFilename(filename: string): string {
    return Buffer.from(filename.slice(0, S3_MAX_FILENAME_LENGTH), 'utf8').toString('base64url');
  }

  /**
   * Reverses `encodeFilename`.
   *
   * @param encoded - base64url value from object metadata.
   * @returns The original filename.
   */
  private decodeFilename(encoded: string): string {
    return Buffer.from(encoded, 'base64url').toString('utf8');
  }

  /**
   * Passes HTTP exceptions through unchanged; logs anything else and returns a generic 500.
   *
   * @param error - Caught error.
   * @param message - Safe client-facing message for unexpected failures.
   * @returns An HTTP exception to throw.
   */
  private toHttpException(error: unknown, message: string): HttpException {
    if (error instanceof HttpException) {
      return error;
    }

    this.logger.error(message, error instanceof Error ? error.stack : undefined);

    return new InternalServerErrorException(message);
  }
}
