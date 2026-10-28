import type { NextFunction, Request, RequestHandler, Response } from 'express';
import { ZodError } from 'zod';
import multer from 'multer';

export class HttpError extends Error {
  constructor(public status: number, message: string, public details?: unknown) {
    super(message);
  }
}

export const wrap =
  (fn: (req: Request, res: Response, next: NextFunction) => Promise<unknown>): RequestHandler =>
  (req, res, next) => {
    fn(req, res, next).catch(next);
  };

export function errorHandler(err: unknown, _req: Request, res: Response, _next: NextFunction) {
  if (err instanceof ZodError) {
    return res.status(400).json({ error: 'Revisa los datos ingresados.', fields: err.flatten().fieldErrors });
  }
  if (err instanceof HttpError) {
    return res.status(err.status).json({ error: err.message, details: err.details });
  }
  if (err instanceof multer.MulterError) {
    const msg =
      err.code === 'LIMIT_FILE_SIZE'
        ? 'Un archivo supera el tamaño máximo de 8 MB.'
        : err.code === 'LIMIT_FILE_COUNT'
          ? 'Superaste el máximo de archivos permitidos.'
          : 'No se pudo procesar el archivo adjunto.';
    return res.status(400).json({ error: msg });
  }
  console.error('[error]', err);
  return res.status(500).json({ error: 'Ocurrió un error en el servidor. Intenta nuevamente.' });
}
