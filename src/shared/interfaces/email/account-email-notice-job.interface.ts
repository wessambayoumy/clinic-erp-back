/** Minimal queue payload shared by account security notifications. */
export interface IAccountEmailNoticeJob {
  email: string;
  occurredAt: string;
}
