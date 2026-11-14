/** Results returned by Redis while validating an OTP challenge. */
export enum OtpCacheOutcomeEnum {
  VERIFIED = 'verified',
  INVALID = 'invalid',
  EXPIRED = 'expired',
  LOCKED = 'locked',
}
