import { ConfigService } from '@nestjs/config';
import {
  FileMailTransport,
  SmtpTransport,
  type MailModuleOptions,
} from '@nestjs/mail';

import { ConfigConsts } from '@/config/config.consts';

/** Creates the local file or configured SMTP transport for account email. */
export function createEmailModuleOptions(
  configService: ConfigService,
): MailModuleOptions {
  const transport = configService.getOrThrow<string>(
    ConfigConsts.email.transport,
  );

  return {
    from: configService.getOrThrow<string>(ConfigConsts.email.from),
    retry: false,
    transport:
      transport === 'file'
        ? new FileMailTransport({ directory: 'var/mail', log: false })
        : new SmtpTransport({
            url: configService.getOrThrow<string>(ConfigConsts.email.smtpUrl),
          }),
  };
}
