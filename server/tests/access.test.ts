import request from 'supertest';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const { users } = vi.hoisted(() => ({
  users: {
    c1: { id: 'c1', email: 'a@a.cl', name: 'Cliente 1', role: 'CLIENT' },
    admin: { id: 'admin', email: 'x@x.cl', name: 'Admin', role: 'ADMIN' },
  } as Record<string, { id: string; email: string; name: string; role: 'CLIENT' | 'ADMIN' }>,
}));
const { quoteRequestFindFirst } = vi.hoisted(() => ({ quoteRequestFindFirst: vi.fn() }));

vi.mock('../src/lib/prisma', () => ({
  prisma: {
    user: { findUnique: vi.fn(async ({ where }: { where: { id: string } }) => users[where.id] ?? null) },
    quoteRequest: { findFirst: quoteRequestFindFirst, count: vi.fn(async () => 0) },
    quoteAttachment: { findUnique: vi.fn(async () => ({ id: 'f1', storageKey: 'k', mimeType: 'image/png', originalName: 'a.png', request: { userId: 'otro' } })) },
  },
}));

import { createApp } from '../src/app';
import { signSession } from '../src/lib/auth';
import { config } from '../src/config';

const app = createApp();
const cookie = (id: string) => `${config.cookieName}=${signSession(id)}`;
const H = { 'x-requested-with': 'sl-web' };

beforeEach(() => quoteRequestFindFirst.mockReset());

describe('control de acceso', () => {
  it('exige sesión para ver solicitudes propias', async () => {
    expect((await request(app).get('/api/quotes/mine')).status).toBe(401);
  });
  it('un cliente no puede entrar al panel de administración', async () => {
    expect((await request(app).get('/api/admin/stats').set('Cookie', cookie('c1'))).status).toBe(403);
  });
  it('un administrador sí puede', async () => {
    expect((await request(app).get('/api/admin/stats').set('Cookie', cookie('admin'))).status).toBe(200);
  });
  it('un cliente solo consulta solicitudes filtradas por su propio id', async () => {
    quoteRequestFindFirst.mockResolvedValue(null);
    const res = await request(app).get('/api/quotes/mine/ajena').set('Cookie', cookie('c1'));
    expect(res.status).toBe(404);
    expect(quoteRequestFindFirst.mock.calls[0][0].where).toEqual({ id: 'ajena', userId: 'c1' });
  });
  it('un cliente no puede descargar adjuntos de otra persona', async () => {
    expect((await request(app).get('/api/files/attachments/f1').set('Cookie', cookie('c1'))).status).toBe(404);
  });
  it('rechaza peticiones que modifican datos sin el encabezado anti-CSRF', async () => {
    expect((await request(app).post('/api/auth/logout')).status).toBe(403);
    expect((await request(app).post('/api/auth/logout').set(H)).status).toBe(200);
  });
  it('rechaza una cookie de sesión falsificada', async () => {
    expect((await request(app).get('/api/admin/stats').set('Cookie', `${config.cookieName}=falsa`)).status).toBe(401);
  });
});
