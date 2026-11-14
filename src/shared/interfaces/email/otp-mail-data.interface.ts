import type { EmailOtpPurposeEnum } from '@/shared/enums/auth';

/** Recipient-specific data rendered in an account one-time-code email. */
export interface IOtpMailData {
  purpose: EmailOtpPurposeEnum;
  code: string;
  expiresInMinutes: number;
}
