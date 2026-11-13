import { Injectable } from '@nestjs/common';
import { html, type Mailable } from '@nestjs/mail';

import type { ILoginNoticeMailData } from '../interfaces';

/** Renders the security notice sent after a successful sign-in. */
@Injectable()
export class LoginNoticeMail implements Mailable<ILoginNoticeMailData> {
  public render(data: ILoginNoticeMailData): {
    subject: string;
    html: ReturnType<typeof html>;
    text: string;
  } {
    return {
      subject: 'A sign-in to your Clinic ERP account completed',
      html: html`<main><h1>Sign-in completed</h1><p>A sign-in to your Clinic ERP account completed at ${data.signedInAt}.</p><p>If this was not you, reset your password and contact your organization administrator.</p></main>`,
      text: `A sign-in to your Clinic ERP account completed at ${data.signedInAt}. If this was not you, reset your password and contact your organization administrator.`,
    };
  }
}
