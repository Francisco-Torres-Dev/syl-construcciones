import crypto from 'crypto';

// Identificador legible de solicitud: SL-2026-A1B2C3
export const quoteCode = (date = new Date()) =>
  `SL-${date.getFullYear()}-${crypto.randomBytes(3).toString('hex').toUpperCase()}`;

export const slugify = (s: string) =>
  s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/&/g, 'y')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
