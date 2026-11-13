import { registerAs } from '@nestjs/config';
import { ConfigEnum } from './config.enum';

/** Resolves validated email delivery and OTP security settings. */
export default registerAs(ConfigEnum.email, () => ({
  transport: process.env.MAIL_TRANSPORT ?? 'file',
  from: `${JSON.stringify(process.env.MAIL_FROM_NAME ?? 'Clinic ERP')} <${process.env.MAIL_FROM ?? 'verification@example.com'}>`,
  smtpUrl: process.env.SMTP_URL,
  otpHashSecret: process.env.EMAIL_OTP_HASH_SECRET,
  bcryptRounds: Number(process.env.EMAIL_BCRYPT_ROUNDS ?? 12),
  codeMaxAttempts: Number(process.env.EMAIL_CODE_MAX_ATTEMPTS ?? 5),
  requestLimitPerHour: Number(
    process.env.EMAIL_REQUEST_LIMIT_PER_HOUR ?? 5,
  ),
}));
