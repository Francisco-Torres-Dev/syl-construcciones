import { describe, expect, it } from 'vitest';
import { quoteSchema, registerSchema, quotationSchema } from '../src/lib/schemas';
import { matchesSignature } from '../src/lib/upload';
import { quoteCode, slugify } from '../src/lib/code';

const validQuote = {
  fullName: 'Ana Pérez', email: 'ANA@mail.cl', phone: '+56 9 1234 5678', region: 'Metropolitana', comuna: 'Maipú',
  serviceName: 'Techumbres y cobertizos', propertyType: 'Casa', description: 'Necesito un cobertizo para dos autos.',
  contactPref: 'email', privacyAccepted: 'true',
};

describe('validación de cotizaciones', () => {
  it('acepta una solicitud válida y normaliza el correo', () => {
    expect(quoteSchema.parse(validQuote).email).toBe('ana@mail.cl');
  });
  it('exige aceptar la política de privacidad', () => {
    expect(() => quoteSchema.parse({ ...validQuote, privacyAccepted: 'false' })).toThrow();
  });
  it('rechaza descripciones muy cortas y teléfonos inválidos', () => {
    expect(() => quoteSchema.parse({ ...validQuote, description: 'corto' })).toThrow();
    expect(() => quoteSchema.parse({ ...validQuote, phone: 'abc' })).toThrow();
  });
});

describe('registro', () => {
  it('ignora cualquier intento de enviar un rol', () => {
    const parsed = registerSchema.parse({ name: 'Eva', email: 'e@e.cl', password: 'clave12345678', role: 'ADMIN' });
    expect('role' in parsed).toBe(false);
  });
  it('rechaza contraseñas débiles', () => {
    expect(() => registerSchema.parse({ name: 'Eva', email: 'e@e.cl', password: 'corta1' })).toThrow();
  });
});

describe('cotización formal', () => {
  it('requiere al menos un ítem', () => {
    expect(() => quotationSchema.parse({ items: [] })).toThrow();
  });
});

describe('archivos y códigos', () => {
  it('detecta firmas falsas', () => {
    expect(matchesSignature(Buffer.from('<?php evil'), 'image/png')).toBe(false);
    expect(matchesSignature(Buffer.from('%PDF-1.7'), 'application/pdf')).toBe(true);
  });
  it('genera códigos y slugs consistentes', () => {
    expect(quoteCode(new Date('2026-01-01'))).toMatch(/^SL-\d{4}-[0-9A-F]{6}$/);
    expect(slugify('Techumbres & Cobertizos')).toBe('techumbres-y-cobertizos');
  });
});
