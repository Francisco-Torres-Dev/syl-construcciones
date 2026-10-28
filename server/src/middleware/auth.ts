import type { NextFunction, Request, Response } from 'express';
import { config } from '../config';
import { readSession } from '../lib/auth';
import { prisma } from '../lib/prisma';
import { HttpError } from '../lib/errors';

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      user?: { id: string; email: string; name: string; role: string };
    }
  }
}

// Carga el usuario desde la base de datos en cada petición: el rol NUNCA se toma del cliente ni del token.
export async function loadUser(req: Request, _res: Response, next: NextFunction) {
  try {
    const token = req.cookies?.[config.cookieName];
    const id = token ? readSession(token) : null;
    if (id) {
      const u = await prisma.user.findUnique({ where: { id }, select: { id: true, email: true, name: true, role: true } });
      if (u) req.user = u;
    }
    next();
  } catch (e) {
    next(e);
  }
}

export function requireAuth(req: Request, _res: Response, next: NextFunction) {
  if (!req.user) return next(new HttpError(401, 'Inicia sesión para continuar.'));
  next();
}

export function requireAdmin(req: Request, _res: Response, next: NextFunction) {
  if (!req.user) return next(new HttpError(401, 'Inicia sesión para continuar.'));
  if (req.user.role !== 'ADMIN') return next(new HttpError(403, 'No tienes permisos para esta acción.'));
  next();
}

// Protección CSRF: las peticiones que modifican datos deben llevar un encabezado personalizado.
// Los navegadores no permiten enviarlo entre orígenes distintos sin pasar por CORS (que es restrictivo).
export function csrfGuard(req: Request, _res: Response, next: NextFunction) {
  if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(req.method) && req.header('x-requested-with') !== 'sl-web') {
    return next(new HttpError(403, 'Solicitud no válida.'));
  }
  next();
}
