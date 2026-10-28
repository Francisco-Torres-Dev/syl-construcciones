import cookieParser from 'cookie-parser';
import cors from 'cors';
import express from 'express';
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import { config } from './config';
import { errorHandler } from './lib/errors';
import { csrfGuard, loadUser } from './middleware/auth';
import { adminRouter } from './routes/admin';
import { authRouter } from './routes/auth';
import { filesRouter } from './routes/files';
import { publicRouter } from './routes/public';
import { quotesRouter } from './routes/quotes';

export function createApp() {
  const app = express();
  app.disable('x-powered-by');
  if (config.isProd || process.env.TRUST_PROXY === 'true') app.set('trust proxy', 1);
  app.use(helmet({ crossOriginResourcePolicy: { policy: 'same-site' } }));
  app.use(cors({ origin: config.clientUrl, credentials: true }));
  app.use(rateLimit({ windowMs: 60 * 1000, limit: 300, standardHeaders: true, legacyHeaders: false }));
  app.use(express.json({ limit: '100kb' }));
  app.use(cookieParser());
  app.use(csrfGuard);
  app.use(loadUser);

  app.get('/api/health', (_req, res) => res.json({ ok: true }));
  app.use('/api/auth', authRouter);
  app.use('/api/quotes', quotesRouter);
  app.use('/api/files', filesRouter);
  app.use('/api/admin', adminRouter);
  app.use('/api', publicRouter);

  app.use((_req, res) => res.status(404).json({ error: 'Ruta no encontrada.' }));
  app.use(errorHandler);
  return app;
}
