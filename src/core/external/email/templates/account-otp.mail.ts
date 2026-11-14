import { Injectable } from '@nestjs/common';
import { html, type Mailable } from '@nestjs/mail';

import { EmailOtpPurposeEnum } from '@/shared/enums/auth';
import type { IOtpMailData } from '@/shared/interfaces/email';

/** Renders sign-up, sign-in, and password-recovery one-time-code messages. */
@Injectable()
export class AccountOtpMail implements Mailable<IOtpMailData> {
  public render(data: IOtpMailData): { subject: string; html: ReturnType<typeof html>; text: string } {
    switch (data.purpose) {
      case EmailOtpPurposeEnum.REGISTRATION:
        return this.renderCode(data, 'Verify your Clinic ERP email', 'verify your email address');
      case EmailOtpPurposeEnum.LOGIN:
        return this.renderCode(data, 'Your Clinic ERP sign-in code', 'complete your sign-in');
      case EmailOtpPurposeEnum.PASSWORD_RESET:
        return this.renderCode(data, 'Your Clinic ERP password reset code', 'reset your password');
    }
  }

  private renderCode(
    data: IOtpMailData,
    subject: string,
    action: string,
  ): { subject: string; html: ReturnType<typeof html>; text: string } {
    return {
      subject,
      html: html`<main><h1>${subject}</h1><p>Use this code to ${action}:</p><p style="font-size:28px;font-weight:bold;letter-spacing:6px">${data.code}</p><p>This code expires in ${data.expiresInMinutes} minutes and can be used once.</p><p>If you did not request this, you can ignore this message.</p></main>`,
      text: `${subject}\n\nUse this code to ${action}: ${data.code}\n\nThis code expires in ${data.expiresInMinutes} minutes and can be used once. If you did not request this, you can ignore this message.`,
    };
  }
}
