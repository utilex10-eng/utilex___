import nodemailer, { type Transporter } from 'nodemailer';

export interface EmailSendResult {
  success: boolean;
  deliveryStatus: 'pending' | 'sent' | 'failed';
  messageId?: string;
  error?: string;
}

export interface ContactEmailPayload {
  name: string;
  email: string;
  subject: string;
  message: string;
  messageId: string;
}

export const PRIMARY_CONTACT_EMAIL = 'utilex10@gmail.com';

/**
 * Creates a configured Nodemailer Transporter if SMTP environment variables are present.
 */
function getTransporter(): Transporter | null {
  const host = process.env.SMTP_HOST;
  const port = parseInt(process.env.SMTP_PORT || '587', 10);
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASSWORD;

  if (!host || !user || !pass) {
    return null;
  }

  return nodemailer.createTransport({
    host,
    port,
    secure: port === 465, // true for 465, false for other ports
    auth: {
      user,
      pass,
    },
    // Production TLS safeguard
    tls: {
      rejectUnauthorized: process.env.NODE_ENV === 'production',
    },
  });
}

/**
 * Delivers Contact Us message to CONTACT_RECEIVER_EMAIL (defaults to utilex10@gmail.com) via secure SMTP.
 */
export async function sendContactNotificationEmail(payload: ContactEmailPayload): Promise<EmailSendResult> {
  const receiverEmail = process.env.CONTACT_RECEIVER_EMAIL || process.env.SMTP_USER || PRIMARY_CONTACT_EMAIL;

  const transporter = getTransporter();

  if (!transporter) {
    console.log(`[Mailer] SMTP credentials not set (SMTP_HOST/USER/PASSWORD). Message queued for ${receiverEmail} in database.`);
    return {
      success: true,
      deliveryStatus: 'pending',
      error: `SMTP credentials missing from environment. Message saved to database for ${receiverEmail}.`,
    };
  }

  const fromEmail = process.env.SMTP_FROM || `UTILEX Platform <${process.env.SMTP_USER || 'no-reply@utilex.com'}>`;

  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f4f4f5; margin: 0; padding: 24px; color: #18181b; }
        .card { max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 16px; border: 1px solid #e4e4e7; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.05); }
        .header { background: #4f46e5; color: #ffffff; padding: 24px; text-align: center; }
        .header h1 { margin: 0; font-size: 20px; font-weight: 800; letter-spacing: -0.5px; }
        .content { padding: 24px; }
        .meta-field { margin-bottom: 12px; }
        .meta-label { font-size: 11px; text-transform: uppercase; font-weight: 700; color: #71717a; margin-bottom: 2px; }
        .meta-value { font-size: 14px; font-weight: 600; color: #09090b; }
        .message-box { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 16px; margin-top: 16px; font-size: 14px; line-height: 1.6; color: #334155; white-space: pre-wrap; }
        .footer { background: #f8fafc; border-top: 1px solid #e2e8f0; padding: 16px; text-align: center; font-size: 12px; color: #94a3b8; }
      </style>
    </head>
    <body>
      <div class="card">
        <div class="header">
          <h1>New Contact Inquiry — UTILEX</h1>
        </div>
        <div class="content">
          <div class="meta-field">
            <div class="meta-label">From</div>
            <div class="meta-value">${escapeHtml(payload.name)} &lt;${escapeHtml(payload.email)}&gt;</div>
          </div>
          <div class="meta-field">
            <div class="meta-label">Subject</div>
            <div class="meta-value">${escapeHtml(payload.subject)}</div>
          </div>
          <div class="meta-field">
            <div class="meta-label">Inquiry Message</div>
            <div class="message-box">${escapeHtml(payload.message)}</div>
          </div>
          <div class="meta-field" style="margin-top: 16px;">
            <div class="meta-label">Inquiry Reference ID</div>
            <div class="meta-value" style="font-family: monospace; font-size: 12px; color: #6366f1;">${escapeHtml(payload.messageId)}</div>
          </div>
        </div>
        <div class="footer">
          Notification dispatched from UTILEX (https://utilex.com) to Founder Daniyal &lt;utilex10@gmail.com&gt;.
        </div>
      </div>
    </body>
    </html>
  `;

  const textContent = `
New Contact Inquiry — UTILEX
----------------------------------------
From: ${payload.name} <${payload.email}>
Subject: ${payload.subject}
Reference ID: ${payload.messageId}

Message:
${payload.message}

----------------------------------------
Dispatched from UTILEX (https://utilex.com) to ${receiverEmail} (Founder: Daniyal <utilex10@gmail.com>)
  `.trim();

  try {
    const info = await transporter.sendMail({
      from: fromEmail,
      to: receiverEmail,
      replyTo: payload.email,
      subject: `[UTILEX Inquiry] ${payload.subject} — from ${payload.name}`,
      text: textContent,
      html: htmlContent,
    });

    console.log(`[Mailer] Contact email sent successfully to ${receiverEmail}. Message ID: ${info.messageId}`);
    return {
      success: true,
      deliveryStatus: 'sent',
      messageId: info.messageId,
    };
  } catch (err: any) {
    console.error('[Mailer] Email delivery failed:', err.message);
    return {
      success: false,
      deliveryStatus: 'failed',
      error: err.message || 'SMTP transmission error',
    };
  }
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
