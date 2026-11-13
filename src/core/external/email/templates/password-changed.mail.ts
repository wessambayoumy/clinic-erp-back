import { Injectable } from '@nestjs/common';
import { html, type Mailable } from '@nestjs/mail';

import type { IPasswordChangedMailData } from '../interfaces';

/** Renders a security notice after an account password changes. */
@Injectable()
export class PasswordChangedMail implements Mailable<IPasswordChangedMailData> {
  /** Renders the password-change alert. */
  public render(data: IPasswordChangedMailData): {
    subject: string;
    html: ReturnType<typeof html>;
    text: string;
  } {
    return {
      subject: 'Your Clinic ERP password was changed',
      html: html`<main><h1>Password changed</h1><p>Your Clinic ERP account password changed at ${data.changedAt}.</p><p>If this was not you, contact your organization administrator immediately.</p></main>`,
      text: `Your Clinic ERP account password changed at ${data.changedAt}. If this was not you, contact your organization administrator immediately.`,
    };
  }
}
