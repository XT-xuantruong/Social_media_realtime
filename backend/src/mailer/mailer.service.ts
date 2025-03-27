import { Injectable } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';

@Injectable()
export class MailService {
  constructor(private mailerService: MailerService) {}

  async sendOtpEmail(to: string, otp: string, fullName: string): Promise<void> {
    const currentDate = new Date().toLocaleDateString('en-US', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    }); // Ví dụ: "27 Mar, 2025"

    await this.mailerService.sendMail({
      to,
      subject: 'Your OTP Code',
      template: 'otp',
      context: {
        otp,
        fullName,
        currentDate,
      },
    });
  }
}
