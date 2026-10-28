import multer from 'multer';
import { config } from '../config';
import { HttpError } from './errors';

export const ALLOWED: Record<string, string> = {
  'image/jpeg': '.jpg',
  'image/png': '.png',
  'image/webp': '.webp',
  'application/pdf': '.pdf',
};

// Verifica la firma real del archivo, no solo el tipo declarado por el navegador.
export function matchesSignature(buf: Buffer, mime: string): boolean {
  if (mime === 'image/jpeg') return buf[0] === 0xff && buf[1] === 0xd8;
  if (mime === 'image/png') return buf.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]));
  if (mime === 'image/webp') return buf.subarray(0, 4).toString() === 'RIFF' && buf.subarray(8, 12).toString() === 'WEBP';
  if (mime === 'application/pdf') return buf.subarray(0, 4).toString() === '%PDF';
  return false;
}

export const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: config.upload.maxBytes, files: config.upload.maxFiles },
  fileFilter: (_req, file, cb) => {
    if (!ALLOWED[file.mimetype]) return cb(new HttpError(400, 'Formato no permitido. Usa JPG, PNG, WEBP o PDF.'));
    cb(null, true);
  },
});
