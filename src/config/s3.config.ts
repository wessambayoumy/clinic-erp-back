import { registerAs } from '@nestjs/config';

import type { IS3Config } from '@shared/interfaces/storage';
import { ConfigEnum } from './config.enum';
import { S3_DEFAULT_MAX_UPLOAD_BYTES } from '@/shared/constants/storage';

/**
 * Normalizes an optional env var: blank strings become `undefined`.
 *
 * @param value - Raw env value.
 * @returns The trimmed value, or `undefined` when unset/blank.
 */
function readOptional(value: string | undefined): string | undefined {
  const trimmed = value?.trim();

  return trimmed === undefined || trimmed === '' ? undefined : trimmed;
}

/**
 * S3 configuration namespace. Fails fast at bootstrap when required variables are missing.
 *
 * Required: `AWS_REGION`, `AWS_S3_BUCKET`.
 * Optional: `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY` (omit on EC2 to use the instance role),
 * `AWS_S3_ENDPOINT`, `AWS_S3_FORCE_PATH_STYLE`, `S3_MAX_UPLOAD_BYTES`.
 */
export const s3Config = registerAs(ConfigEnum.s3, (): IS3Config => {
  const region = readOptional(process.env.AWS_REGION);
  const bucket = readOptional(process.env.AWS_S3_BUCKET);

  if (region === undefined || bucket === undefined) {
    throw new Error('AWS_REGION and AWS_S3_BUCKET must be set');
  }

  const maxUploadBytes = Number.parseInt(
    process.env.S3_MAX_UPLOAD_BYTES ?? '',
    10,
  );

  return {
    region,
    bucket,
    endpoint: readOptional(process.env.AWS_S3_ENDPOINT),
    forcePathStyle: process.env.AWS_S3_FORCE_PATH_STYLE === 'true',
    accessKeyId: readOptional(process.env.AWS_ACCESS_KEY_ID),
    secretAccessKey: readOptional(process.env.AWS_SECRET_ACCESS_KEY),
    maxUploadBytes:
      Number.isNaN(maxUploadBytes) || maxUploadBytes <= 0
        ? S3_DEFAULT_MAX_UPLOAD_BYTES
        : maxUploadBytes,
  };
});
