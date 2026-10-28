import { Router } from 'express';
import { wrap, HttpError } from '../lib/errors';
import { prisma } from '../lib/prisma';
import { getSettings } from '../lib/settings';

export const publicRouter = Router();

publicRouter.get('/settings', wrap(async (_req, res) => res.json(await getSettings())));

publicRouter.get('/projects', wrap(async (_req, res) => {
  const projects = await prisma.project.findMany({ where: { published: true }, orderBy: { sortOrder: 'asc' }, include: { images: true } });
  res.json({ projects });
}));

publicRouter.get('/projects/:slug', wrap(async (req, res) => {
  const project = await prisma.project.findFirst({ where: { slug: req.params.slug, published: true }, include: { images: true } });
  if (!project) throw new HttpError(404, 'Proyecto no encontrado.');
  res.json({ project });
}));

// Imágenes públicas de proyectos: solo si pertenecen a un proyecto publicado.
publicRouter.get('/project-images/:id', wrap(async (req, res) => {
  const { readFile } = await import('../lib/storage');
  const img = await prisma.projectImage.findFirst({ where: { id: req.params.id, project: { published: true } } });
  if (!img) throw new HttpError(404, 'Imagen no encontrada.');
  res.setHeader('Cache-Control', 'public, max-age=86400');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  (await readFile(img.storageKey)).pipe(res);
}));
