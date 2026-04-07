import { Injectable } from '@nestjs/common';
import { emailTemplates } from './email.templates';
import { MailerService } from '@nestjs-modules/mailer';

@Injectable()
export class EmailService {
  constructor(private mailerService: MailerService) {}

  sendRegistrationEmail(email: string, code: string): Promise<void> {
    return this.mailerService.sendMail({
      to: email,
      subject: 'registration',
      template: emailTemplates.getRegistrationTemplate(code),
    });
  }

  sendPasswordRecoveryEmail(email: string, code: string): Promise<void> {
    return this.mailerService.sendMail({
      to: email,
      subject: 'password-recovery',
      template: emailTemplates.getPasswordRecoveryTemplate(code),
    });
  }
}
