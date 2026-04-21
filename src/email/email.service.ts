import { Injectable } from '@nestjs/common';
import { Resend } from 'resend';

@Injectable()
export class EmailService {
  private resend = new Resend(process.env.RESEND_API_KEY);

  async sendVerificationEmail(to: string, code: string) {
    const html = this.buildTemplate(code);

    await this.resend.emails.send({
      from: process.env.EMAIL_FROM!,
      to,
      subject: 'Verify your email',
      html,
    });
  }

  private buildTemplate(code: string): string {
    return `
  <div style="background:#0f172a;padding:40px;color:white;font-family:sans-serif">
    <div style="max-width:500px;margin:auto;background:#1e293b;padding:30px;border-radius:10px;text-align:center">
      
      <h1 style="margin-bottom:10px;">WarGames Store</h1>
      <p style="color:#94a3b8;">Email verification</p>

      <div style="
        background:#0f172a;
        padding:20px;
        border-radius:8px;
        font-size:32px;
        letter-spacing:6px;
        margin:20px 0;
      ">
        ${code}
      </div>

      <p style="color:#94a3b8;">
        This code expires in 10 minutes.
      </p>

      <hr style="margin:20px 0;border-color:#334155"/>

      <small style="color:#64748b;">
        If you didn’t request this, you can ignore this email.
      </small>
    </div>
  </div>
  `;
  }
}
