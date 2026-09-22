import { ConfigService } from '@nestjs/config';
import { MailService } from './mail.service';
import * as nodemailer from 'nodemailer';
jest.mock('nodemailer', () => ({ createTransport: jest.fn(), createTestAccount: jest.fn() }));
const configuration = (values: Record<string, string>) => ({ get: (key: string) => values[key] }) as ConfigService;
describe('mail initialization', () => {
  it('parses port 465 and initializes before the first invitation', async () => {
    const sendMail = jest.fn().mockResolvedValue({});
    (nodemailer.createTransport as jest.Mock).mockReturnValue({ sendMail });
    const service = new MailService(configuration({
      NODE_ENV: 'production', SMTP_HOST: 'smtp.example.test', SMTP_PORT: '465',
      SMTP_USER: 'user', SMTP_PASS: 'pass', SMTP_FROM: 'sender@example.test', FRONTEND_URL: 'https://app.example.test',
    }));
    await service.onModuleInit();
    await service.sendAdminInvitation('recipient@example.test', 'invite-token');
    expect(nodemailer.createTransport).toHaveBeenCalledWith(expect.objectContaining({ port: 465, secure: true }));
    expect(sendMail).toHaveBeenCalledWith(expect.objectContaining({ text: expect.stringContaining('https://app.example.test/invite/invite-token') }));
  });
  it('never falls back to test email in production', async () => {
    const service = new MailService(configuration({ NODE_ENV: 'production' }));
    await expect(service.onModuleInit()).rejects.toThrow('incomplete');
    expect(nodemailer.createTestAccount).not.toHaveBeenCalled();
  });
});
