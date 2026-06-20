import { Injectable, Logger } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class MailService {
  private transporter: nodemailer.Transporter;
  private readonly logger = new Logger(MailService.name);
  private isEthereal = false;

  constructor(private configService: ConfigService) {
    this.initTransporter();
  }

  private async initTransporter() {
    const host = this.configService.get<string>('SMTP_HOST');
    const port = this.configService.get<number>('SMTP_PORT');
    const user = this.configService.get<string>('SMTP_USER');
    const pass = this.configService.get<string>('SMTP_PASS');

    if (host && user && pass) {
      // Use provided real SMTP
      this.transporter = nodemailer.createTransport({
        host,
        port: port || 587,
        secure: port === 465, // true for 465, false for other ports
        auth: { user, pass },
      });
      this.logger.log(`Initialized MailService with real SMTP (${host})`);
    } else {
      // Fallback to Ethereal Email for development
      this.logger.warn('No SMTP config found. Falling back to Ethereal Email (Development Only)');
      const testAccount = await nodemailer.createTestAccount();
      this.isEthereal = true;
      
      this.transporter = nodemailer.createTransport({
        host: testAccount.smtp.host,
        port: testAccount.smtp.port,
        secure: testAccount.smtp.secure,
        auth: {
          user: testAccount.user,
          pass: testAccount.pass,
        },
      });
      this.logger.log(`Initialized MailService with Ethereal Email (${testAccount.user})`);
    }
  }

  async sendAdminInvitation(email: string, token: string) {
    // We assume the frontend runs on localhost:3000 in dev, or FRONTEND_URL from env
    const frontendUrl = this.configService.get<string>('FRONTEND_URL') || 'http://localhost:3000';
    const inviteLink = `${frontendUrl}/invite/${token}`;

    const mailOptions = {
      from: this.configService.get<string>('SMTP_FROM') || '"Annotator" <no-reply@annotator.com>',
      to: email,
      subject: 'You have been invited to become an Admin',
      text: `Hello, you have been invited to become an Admin on our platform. Please click the following link to accept your invitation: ${inviteLink}`,
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px;">
          <h2>Admin Invitation</h2>
          <p>Hello,</p>
          <p>You have been invited to become an Admin on our platform.</p>
          <p>Please click the button below to accept your invitation and set up your account:</p>
          <a href="${inviteLink}" style="display: inline-block; padding: 10px 20px; background-color: #4f46e5; color: #ffffff; text-decoration: none; border-radius: 5px;">Accept Invitation</a>
          <p style="margin-top: 20px; font-size: 12px; color: #6b7280;">If the button does not work, copy and paste this URL into your browser:<br/>${inviteLink}</p>
        </div>
      `,
    };

    try {
      const info = await this.transporter.sendMail(mailOptions);
      this.logger.log(`Invitation email sent to ${email}`);
      if (this.isEthereal) {
        this.logger.log(`Ethereal Email Preview URL: ${nodemailer.getTestMessageUrl(info)}`);
      }
    } catch (error) {
      this.logger.error(`Failed to send invitation email to ${email}`, error);
      throw new Error('Failed to send email');
    }
  }
}
