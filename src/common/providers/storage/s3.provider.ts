import { s3Config } from '@/config/s3.config';
import { S3_CLIENT } from '@/shared/constants/storage';
import { S3Client } from '@aws-sdk/client-s3';
import type { Provider } from '@nestjs/common';

import type { IS3Config } from '@shared/interfaces/storage';

/**
 * Provides a single shared `S3Client` for the whole app.
 * Uses explicit credentials only when both keys are configured; otherwise
 * the SDK's default credential chain applies (EC2 instance role, env, profile).
 */
export const s3ClientProvider: Provider<S3Client> = {
  provide: S3_CLIENT,
  inject: [s3Config.KEY],
  useFactory: (config: IS3Config): S3Client =>
    new S3Client({
      region: config.region,
      endpoint: config.endpoint,
      forcePathStyle: config.forcePathStyle,
      credentials:
        config.accessKeyId !== undefined && config.secretAccessKey !== undefined
          ? {
              accessKeyId: config.accessKeyId,
              secretAccessKey: config.secretAccessKey,
            }
          : undefined,
    }),
};
