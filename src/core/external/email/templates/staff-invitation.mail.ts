import { Injectable } from '@nestjs/common';
import { html, type Mailable } from '@nestjs/mail';

import type { IStaffInvitationMailData } from '../interfaces';

/** Renders an invitation message for a new staff member. */
@Injectable()
export class StaffInvitationMail implements Mailable<IStaffInvitationMailData> {
  public render(data: IStaffInvitationMailData): {
    subject: string;
    html: ReturnType<typeof html>;
    text: string;
  } {
    return {
      subject: `Invitation to join ${data.organizationName}`,
      html: html`<main><h1>You're invited</h1><p>You've been invited to join ${data.organizationName} on Clinic ERP.</p><p><a href="${data.invitationUrl}">Accept invitation</a></p><p>This invitation expires in ${data.expiresInHours} hours. If you did not expect it, you can ignore this message.</p></main>`,
      text: `You've been invited to join ${data.organizationName} on Clinic ERP. Accept the invitation: ${data.invitationUrl}\n\nThis invitation expires in ${data.expiresInHours} hours.`,
    };
  }
}
