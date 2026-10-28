import nodemailer from 'nodemailer';
import { config, emailConfigured } from '../config';

let transport: nodemailer.Transporter | null = null;

export async function sendMail(to: string, subject: string, text: string) {
  if (!emailConfigured()) {
    console.warn(`[mail] SMTP no configurado. Correo NO enviado a ${to}: ${subject}`);
    if (!config.isProd) console.warn(text);
    return { sent: false };
  }
  transport ??= nodemailer.createTransport({
    host: config.smtp.host,
    port: config.smtp.port,
    secure: config.smtp.port === 465,
    auth: { user: config.smtp.user, pass: config.smtp.pass },
  });
  try {
    await transport.sendMail({ from: config.smtp.from, to, subject, text });
    return { sent: true };
  } catch (e) {
    console.error('[mail] error al enviar', e);
    return { sent: false };
  }
}
