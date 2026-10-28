import { Router } from 'express';
import { HttpError, wrap } from '../lib/errors';
import { prisma } from '../lib/prisma';
import { readFile } from '../lib/storage';
import { requireAuth } from '../middleware/auth';

export const filesRouter = Router();

// Descarga de adjuntos: solo el dueño de la solicitud o un administrador.
filesRouter.get('/attachments/:id', requireAuth, wrap(async (req, res) => {
  const a = await prisma.quoteAttachment.findUnique({ where: { id: req.params.id }, include: { request: { select: { userId: true } } } });
  const allowed = a && (req.user!.role === 'ADMIN' || a.request.userId === req.user!.id);
  if (!a || !allowed) throw new HttpError(404, 'Archivo no encontrado.'); // 404 para no revelar su existencia
  res.setHeader('Content-Type', a.mimeType);
  res.setHeader('Content-Disposition', `inline; filename*=UTF-8''${encodeURIComponent(a.originalName)}`);
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('Cache-Control', 'private, no-store');
  (await readFile(a.storageKey)).pipe(res);
}));
