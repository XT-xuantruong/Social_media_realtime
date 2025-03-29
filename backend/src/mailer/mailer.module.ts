import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MailerModule as mailer } from '@nestjs-modules/mailer';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter';
import * as path from 'path';
import { MailService } from './mailer.service';
@Module({
  imports: [
    ConfigModule.forRoot(),
    mailer.forRoot({
      transport: {
        host: process.env.MAIL_HOST,
        port: Number(process.env.MAIL_PORT),
        secure: false,
        auth: {
          user: process.env.MAIL_USER,
          pass: process.env.MAIL_PASS,
        },
        tls: {
          rejectUnauthorized: true, // Từ chối nếu chứng chỉ không hợp lệ
          minVersion: 'TLSv1.2', // Đảm bảo dùng TLS 1.2 trở lên
        },
      },
      defaults: {
        from: `"Social Media" <${process.env.MAIL_FROM}>`,
      },
      template: {
        dir: path.join(__dirname, '../..', 'templates'),
        adapter: new HandlebarsAdapter(),
        options: {
          strict: true,
        },
      },
    }),
  ],
  providers: [MailService],
  exports: [MailService],
})
export class MailerModule {}
