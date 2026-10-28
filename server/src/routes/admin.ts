import { Prisma } from '@prisma/client';
import { Router } from 'express';
import { z } from 'zod';
import { audit, notify } from '../lib/audit';
import { slugify } from '../lib/code';
import { HttpError, wrap } from '../lib/errors';
import { prisma } from '../lib/prisma';
import { noteSchema, projectSchema, quotationSchema, settingsSchema, statusSchema } from '../lib/schemas';
import { DEFAULT_SETTINGS, getSettings } from '../lib/settings';
import { deleteFile, saveFile } from '../lib/storage';
import { ALLOWED, matchesSignature, upload } from '../lib/upload';
import { requireAdmin } from '../middleware/auth';

export const adminRouter = Router();
adminRouter.use(requireAdmin);

const paging = z.object({ page: z.coerce.number().int().min(1).default(1), pageSize: z.coerce.number().int().min(1).max(100).default(20) });

// ---------- Dashboard (cifras calculadas desde la base de datos) ----------
adminRouter.get('/stats', wrap(async (_req, res) => {
  const [total, nuevas, pendientes, enviadas, aceptadas, finalizadas] = await Promise.all([
    prisma.quoteRequest.count(),
    prisma.quoteRequest.count({ where: { status: 'NUEVA' } }),
    prisma.quoteRequest.count({ where: { status: { in: ['EN_REVISION', 'PENDIENTE_INFORMACION'] } } }),
    prisma.quoteRequest.count({ where: { status: 'COTIZACION_ENVIADA' } }),
    prisma.quoteRequest.count({ where: { status: 'ACEPTADA' } }),
    prisma.quoteRequest.count({ where: { status: 'FINALIZADA' } }),
  ]);
  res.json({ total, nuevas, pendientes, enviadas, aceptadas, finalizadas });
}));

// ---------- Solicitudes ----------
adminRouter.get('/quotes', wrap(async (req, res) => {
  const { page, pageSize } = paging.parse(req.query);
  const f = z.object({
    q: z.string().trim().max(100).optional(), status: z.string().optional(), service: z.string().optional(),
    comuna: z.string().trim().optional(), from: z.string().optional(), to: z.string().optional(),
  }).parse(req.query);
  const where: Prisma.QuoteRequestWhereInput = {};
  if (f.q) where.OR = [{ fullName: { contains: f.q } }, { code: { contains: f.q } }, { email: { contains: f.q } }];
  if (f.status) where.status = f.status as Prisma.QuoteRequestWhereInput['status'];
  if (f.service) where.serviceName = f.service;
  if (f.comuna) where.comuna = { contains: f.comuna };
  if (f.from || f.to) where.createdAt = { ...(f.from && { gte: new Date(f.from) }), ...(f.to && { lte: new Date(f.to + 'T23:59:59') }) };
  const [items, total] = await Promise.all([
    prisma.quoteRequest.findMany({ where, orderBy: { createdAt: 'desc' }, skip: (page - 1) * pageSize, take: pageSize,
      select: { id: true, code: true, fullName: true, email: true, serviceName: true, comuna: true, status: true, createdAt: true } }),
    prisma.quoteRequest.count({ where }),
  ]);
  res.json({ items, total, page, pageSize });
}));

adminRouter.get('/quotes/:id', wrap(async (req, res) => {
  const quote = await prisma.quoteRequest.findUnique({
    where: { id: req.params.id },
    include: { attachments: true, notes: { include: { author: { select: { name: true } } }, orderBy: { createdAt: 'desc' } },
      quotations: { include: { items: true }, orderBy: { createdAt: 'desc' } }, user: { select: { id: true, name: true, email: true } } },
  });
  if (!quote) throw new HttpError(404, 'Solicitud no encontrada.');
  const history = await prisma.auditLog.findMany({ where: { entity: 'QuoteRequest', entityId: quote.id }, orderBy: { createdAt: 'desc' }, include: { actor: { select: { name: true } } } });
  res.json({ quote, history: history.map(({ meta, ...entry }) => ({ ...entry, meta: meta ? JSON.parse(meta) : null })) });
}));

adminRouter.patch('/quotes/:id/status', wrap(async (req, res) => {
  const { status } = statusSchema.parse(req.body);
  const prev = await prisma.quoteRequest.findUnique({ where: { id: req.params.id } });
  if (!prev) throw new HttpError(404, 'Solicitud no encontrada.');
  const q = await prisma.quoteRequest.update({ where: { id: prev.id }, data: { status } });
  await audit(req.user!.id, 'STATUS_CHANGE', 'QuoteRequest', q.id, { from: prev.status, to: status });
  if (q.userId) await notify(q.userId, 'Actualización de tu solicitud', `Tu solicitud ${q.code} cambió a: ${status.replace(/_/g, ' ').toLowerCase()}.`);
  res.json({ quote: q });
}));

adminRouter.post('/quotes/:id/notes', wrap(async (req, res) => {
  const { body } = noteSchema.parse(req.body);
  const exists = await prisma.quoteRequest.findUnique({ where: { id: req.params.id }, select: { id: true } });
  if (!exists) throw new HttpError(404, 'Solicitud no encontrada.');
  const note = await prisma.internalNote.create({ data: { requestId: exists.id, authorId: req.user!.id, body }, include: { author: { select: { name: true } } } });
  await audit(req.user!.id, 'NOTE_ADDED', 'QuoteRequest', exists.id);
  res.status(201).json({ note });
}));

// Crea una cotización formal (propuesta económica) asociada a la solicitud.
adminRouter.post('/quotes/:id/quotations', wrap(async (req, res) => {
  const d = quotationSchema.parse(req.body);
  const request = await prisma.quoteRequest.findUnique({ where: { id: req.params.id } });
  if (!request) throw new HttpError(404, 'Solicitud no encontrada.');
  const quotation = await prisma.quotation.create({
    data: { requestId: request.id, materials: d.materials, timeline: d.timeline, conditions: d.conditions, exclusions: d.exclusions,
      status: d.send ? 'ENVIADA' : 'BORRADOR', sentAt: d.send ? new Date() : null, items: { create: d.items } },
    include: { items: true },
  });
  await audit(req.user!.id, d.send ? 'QUOTATION_SENT' : 'QUOTATION_DRAFT', 'QuoteRequest', request.id, { quotationId: quotation.id });
  if (d.send) {
    await prisma.quoteRequest.update({ where: { id: request.id }, data: { status: 'COTIZACION_ENVIADA' } });
    if (request.userId) await notify(request.userId, 'Tienes una cotización', `Ya está disponible la cotización de tu solicitud ${request.code}.`);
  }
  res.status(201).json({ quotation });
}));

// ---------- Proyectos ----------
adminRouter.get('/projects', wrap(async (_req, res) => {
  res.json({ projects: await prisma.project.findMany({ orderBy: { sortOrder: 'asc' }, include: { images: true } }) });
}));
adminRouter.post('/projects', wrap(async (req, res) => {
  const d = projectSchema.parse(req.body);
  const p = await prisma.project.create({ data: { ...d, slug: slugify(d.slug || d.title) } });
  await audit(req.user!.id, 'CREATE', 'Project', p.id);
  res.status(201).json({ project: p });
}));
adminRouter.put('/projects/:id', wrap(async (req, res) => {
  const d = projectSchema.parse(req.body);
  const p = await prisma.project.update({ where: { id: req.params.id }, data: { ...d, slug: slugify(d.slug || d.title) } });
  await audit(req.user!.id, 'UPDATE', 'Project', p.id);
  res.json({ project: p });
}));
adminRouter.delete('/projects/:id', wrap(async (req, res) => {
  const imgs = await prisma.projectImage.findMany({ where: { projectId: req.params.id } });
  await prisma.project.delete({ where: { id: req.params.id } });
  await Promise.all(imgs.map((i) => deleteFile(i.storageKey)));
  await audit(req.user!.id, 'DELETE', 'Project', req.params.id);
  res.json({ ok: true });
}));
adminRouter.post('/projects/:id/images', upload.array('files', 10), wrap(async (req, res) => {
  const project = await prisma.project.findUnique({ where: { id: req.params.id } });
  if (!project) throw new HttpError(404, 'Proyecto no encontrado.');
  const files = ((req.files as Express.Multer.File[]) ?? []).filter((f) => f.mimetype.startsWith('image/'));
  if (!files.length) throw new HttpError(400, 'Sube al menos una imagen (JPG, PNG o WEBP).');
  const created = [];
  for (const f of files) {
    if (!matchesSignature(f.buffer, f.mimetype)) throw new HttpError(400, `"${f.originalname}" no coincide con su formato.`);
    const key = await saveFile(f.buffer, ALLOWED[f.mimetype], 'projects', f.mimetype);
    created.push(await prisma.projectImage.create({ data: { projectId: project.id, storageKey: key, alt: String(req.body.alt || project.title).slice(0, 200) } }));
  }
  await audit(req.user!.id, 'ADD_IMAGES', 'Project', project.id, { count: created.length });
  res.status(201).json({ images: created });
}));
adminRouter.delete('/project-images/:id', wrap(async (req, res) => {
  const img = await prisma.projectImage.findUnique({ where: { id: req.params.id } });
  if (!img) throw new HttpError(404, 'Imagen no encontrada.');
  await prisma.projectImage.delete({ where: { id: img.id } });
  await deleteFile(img.storageKey);
  res.json({ ok: true });
}));

// ---------- Clientes ----------
adminRouter.get('/users', wrap(async (req, res) => {
  const { page, pageSize } = paging.parse(req.query);
  const q = z.string().trim().max(100).optional().parse(req.query.q);
  const where: Prisma.UserWhereInput = q ? { OR: [{ name: { contains: q } }, { email: { contains: q } }] } : {};
  const [items, total] = await Promise.all([
    prisma.user.findMany({ where, orderBy: { createdAt: 'desc' }, skip: (page - 1) * pageSize, take: pageSize,
      select: { id: true, name: true, email: true, phone: true, role: true, createdAt: true, _count: { select: { quotes: true } } } }),
    prisma.user.count({ where }),
  ]);
  res.json({ items, total, page, pageSize });
}));

// ---------- Configuración ----------
adminRouter.get('/settings', wrap(async (_req, res) => res.json(await getSettings())));
adminRouter.put('/settings', wrap(async (req, res) => {
  const d = settingsSchema.parse({ ...DEFAULT_SETTINGS, ...req.body });
  const value = JSON.stringify(d);
  await prisma.setting.upsert({ where: { key: 'site' }, update: { value }, create: { key: 'site', value } });
  await audit(req.user!.id, 'UPDATE', 'Setting', 'site');
  res.json(await getSettings());
}));
