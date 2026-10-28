import request from 'supertest';
import { describe, expect, it } from 'vitest';
import handler from '../../api';

describe('función API de Vercel', () => {
  it('enruta el health check a Express', async () => {
    const response = await request(handler).get('/api?__vercel_path=health');

    expect(response.status).toBe(200);
    expect(response.body).toEqual({ ok: true });
  });

  it('enruta los endpoints anidados de autenticación a Express', async () => {
    const response = await request(handler).get('/api?__vercel_path=auth/config');

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('emailConfigured');
  });

  it('preserva los errores de validación del registro', async () => {
    const response = await request(handler)
      .post('/api?__vercel_path=auth/register')
      .set('X-Requested-With', 'sl-web')
      .send({ name: 'x', email: 'invalid', password: 'short' });

    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty('error', 'Revisa los datos ingresados.');
  });
});
