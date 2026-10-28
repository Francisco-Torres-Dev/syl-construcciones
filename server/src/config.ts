import 'dotenv/config';

const env = process.env;
const isProd = env.NODE_ENV === 'production';

function required(name: string, fallbackDev?: string): string {
  const v = env[name] || (isProd ? undefined : fallbackDev);
  if (!v) throw new Error(`Falta la variable de entorno ${name}`);
  return v;
}

export const config = {
  isProd,
  port: Number(env.PORT ?? 4000),
  clientUrl: env.CLIENT_URL ?? 'http://localhost:5173',
  jwtSecret: required('JWT_SECRET', 'dev-only-secret-change-me-please-32chars'),
  cookieName: 'sl_session',
  requireEmailVerification: env.REQUIRE_EMAIL_VERIFICATION === 'true',
  google: { clientId: env.GOOGLE_CLIENT_ID ?? '' },
  smtp: {
    host: env.SMTP_HOST ?? '',
    port: Number(env.SMTP_PORT ?? 587),
    user: env.SMTP_USER ?? '',
    pass: env.SMTP_PASS ?? '',
    from: env.MAIL_FROM ?? 'S&L Construcciones <adminsylconstrucciones@gmail.com>',
    adminInbox: env.ADMIN_NOTIFY_EMAIL ?? '',
  },
  storage: {
    driver: (env.STORAGE_DRIVER ?? 'local') as 'local' | 's3',
    localDir: env.LOCAL_UPLOAD_DIR ?? (env.VERCEL ? '/tmp/sl-construcciones-uploads' : 'uploads'),
    s3: {
      bucket: env.S3_BUCKET ?? '',
      region: env.S3_REGION ?? 'auto',
      endpoint: env.S3_ENDPOINT || undefined,
      accessKeyId: env.S3_ACCESS_KEY_ID ?? '',
      secretAccessKey: env.S3_SECRET_ACCESS_KEY ?? '',
    },
  },
  upload: { maxFiles: 8, maxBytes: 8 * 1024 * 1024 },
};

export const emailConfigured = () => Boolean(config.smtp.host && config.smtp.user);
export const googleConfigured = () => Boolean(config.google.clientId);
