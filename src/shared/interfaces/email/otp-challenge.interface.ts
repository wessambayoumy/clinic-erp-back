import type { EmailOtpPurposeEnum } from '@/shared/enums/auth';

/** Short-lived OTP challenge returned to a client without exposing the code. */
export interface IOtpChallenge {
  challengeId: string;
  purpose: EmailOtpPurposeEnum;
  expiresInSeconds: number;
}
