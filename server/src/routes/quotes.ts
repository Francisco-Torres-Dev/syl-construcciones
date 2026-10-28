import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { config } from '../config';
import { audit, notify } from '../lib/audit';
import { quoteCode } from '../lib/code';
import { HttpError, wrap } from '../lib/errors';
import { sendMail } from '../lib/mailer';
import { prisma } from '../lib/prisma';
import { quoteSchema } from '../lib/schemas';
import { saveFile } from '../lib/storage';
import { ALLOWED, matchesSignature, upload } from '../lib/upload';
import { requireAuth } from '../middleware/auth';

export const quotesRouter = Router();

const limiter = rateLimit({ windowMs: 60 * 60 * 1000, limit: 10, standardHeaders: true, legacyHeaders: false, message: { error: 'Enviaste muchas solicitudes. Intenta más tarde.' } });

quotesRouter.post('/', limiter, upload.array('files', config.upload.maxFiles), wrap(async (req, res) => {
  const data = quoteSchema.parse(req.body);
  const files = (req.files as Express.Multer.File[] | undefined) ?? [];
  for (const f of files) {
    if (!matchesSignature(f.buffer, f.mimetype)) throw new HttpError(400, `El archivo "${f.originalname}" no coincide con su formato.`);
  }
  let tentativeDate: Date | null = null;
  if (data.tentativeDate) {
    tentativeDate = new Date(data.tentativeDate);
    if (Number.isNaN(tentativeDate.getTime())) throw new HttpError(400, 'La fecha tentativa no es válida.');
  }
  const keys: { key: string; f: Express.Multer.File }[] = [];
  for (const f of files) keys.push({ key: await saveFile(f.buffer, ALLOWED[f.mimetype], 'quotes', f.mimetype), f });

  const request = await prisma.quoteRequest.create({
    data: {
      code: quoteCode(),
      userId: req.user?.id ?? null, // se asocia a la cuenta solo si hay sesión
      fullName: data.fullName, email: data.email, phone: data.phone, region: data.region, comuna: data.comuna,
      serviceName: data.serviceName, propertyType: data.propertyType,
      description: data.description, dimensions: data.dimensions || null, budget: data.budget || null,
      tentativeDate, contactPref: data.contactPref, privacyAcceptedAt: new Date(),
      attachments: { create: keys.map(({ key, f }) => ({ storageKey: key, originalName: f.originalname.slice(0, 200), mimeType: f.mimetype, size: f.size })) },
    },
  });

  // Los correos no bloquean el éxito de la solicitud; si faltan credenciales SMTP queda registrado en el log del servidor.
  void sendMail(request.email, `Recibimos tu solicitud ${request.code} — S&L Construcciones`, `Hola ${request.fullName},\n\nRecibimos tu solicitud de cotización (${request.code}) por "${request.serviceName}". Te contactaremos pronto.\n`);
  if (config.smtp.adminInbox) void sendMail(config.smtp.adminInbox, `Nueva solicitud ${request.code}`, `${request.fullName} (${request.email}) solicitó: ${request.serviceName} en ${request.comuna}.`);
  if (request.userId) await notify(request.userId, 'Solicitud recibida', `Tu solicitud ${request.code} fue registrada.`);

  res.status(201).json({ id: request.id, code: request.code });
}));

quotesRouter.get('/mine', requireAuth, wrap(async (req, res) => {
  const quotes = await prisma.quoteRequest.findMany({
    where: { userId: req.user!.id }, orderBy: { createdAt: 'desc' },
    select: { id: true, code: true, serviceName: true, description: true, status: true, createdAt: true, _count: { select: { attachments: true } },
      quotations: { where: { status: 'ENVIADA' }, select: { id: true } } },
  });
  res.json({ quotes });
}));

// Solo el propietario ve su solicitud. Las notas internas NUNCA se incluyen.
quotesRouter.get('/mine/:id', requireAuth, wrap(async (req, res) => {
  const q = await prisma.quoteRequest.findFirst({
    where: { id: req.params.id, userId: req.user!.id },
    include: { attachments: { select: { id: true, originalName: true, mimeType: true, size: true } },
      quotations: { where: { status: 'ENVIADA' }, include: { items: true } } },
  });
  if (!q) throw new HttpError(404, 'Solicitud no encontrada.');
  res.json({ quote: q });
}));

quotesRouter.get('/notifications', requireAuth, wrap(async (req, res) => {
  const items = await prisma.notification.findMany({ where: { userId: req.user!.id }, orderBy: { createdAt: 'desc' }, take: 30 });
  res.json({ notifications: items });
}));

quotesRouter.post('/notifications/read', requireAuth, wrap(async (req, res) => {
  await prisma.notification.updateMany({ where: { userId: req.user!.id, read: false }, data: { read: true } });
  res.json({ ok: true });
}));
