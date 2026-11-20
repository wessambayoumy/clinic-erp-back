import { HeadBucketCommand, S3Client } from '@aws-sdk/client-s3';
import { Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  HealthIndicatorService,
  type HealthIndicatorResult,
} from '@nestjs/terminus';

import { LoggerService } from '@/common/modules/observability/logging/logger.service';
import { S3_CLIENT } from '@/shared/constants/storage';

/** Checks S3 bucket availability using the configured shared S3 client. */
@Injectable()
export class S3HealthIndicator {
  constructor(
    @Inject(S3_CLIENT) private readonly s3Client: S3Client,
    private readonly configService: ConfigService,
    private readonly logger: LoggerService,
    private readonly healthIndicatorService: HealthIndicatorService,
  ) {}

  /** Pings the configured bucket and returns its health state. */
  public async isHealthy(): Promise<HealthIndicatorResult> {
    const indicator = this.healthIndicatorService.check('s3');

    try {
      const bucket = this.configService.get<string>('AWS_S3_BUCKET');
      if (!bucket) {
        return indicator.down('AWS_S3_BUCKET is not configured');
      }
      await this.s3Client.send(new HeadBucketCommand({ Bucket: bucket }));
      return indicator.up();
    } catch (error: unknown) {
      this.logger.error(
        `S3 health check failed: ${error instanceof Error ? error.message : String(error)}`,
      );
      return indicator.down();
    }
  }
}
