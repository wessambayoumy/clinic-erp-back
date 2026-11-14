import { Injectable } from '@nestjs/common';
import { Processor, WorkerHost } from '@nestjs/bullmq';
import type { Job } from 'bullmq';

import { EmailService } from '@/common/services/email';
import { LoggerService } from '@/common/modules/observability/logging/logger.service';
import { EmailJobNameEnum, EmailQueueEnum } from '@/shared/enums';
import type { IAccountEmailNoticeJob } from '@/shared/interfaces/email';

/** Delivers non-critical account security notifications asynchronously. */
@Injectable()
@Processor(EmailQueueEnum.ACCOUNT_NOTIFICATIONS)
export class EmailNotificationProcessor extends WorkerHost {
  constructor(
    private readonly email: EmailService,
    private readonly logger: LoggerService,
  ) {
    super();
  }

  /** Processes queued account notification messages without logging recipient data. */
  public async process(job: Job<IAccountEmailNoticeJob>): Promise<void> {
    switch (job.name) {
      case EmailJobNameEnum.SIGN_IN_NOTICE:
        await this.email.sendLoginNotice(
          job.data.email,
          new Date(job.data.occurredAt),
        );
        return;
      case EmailJobNameEnum.PASSWORD_CHANGED_NOTICE:
        await this.email.sendPasswordChangedNotice(
          job.data.email,
          new Date(job.data.occurredAt),
        );
        return;
      default:
        this.logger.warn(`Ignored unsupported email job: ${job.name}`);
    }
  }
}
