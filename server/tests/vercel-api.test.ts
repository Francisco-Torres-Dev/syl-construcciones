import request from 'supertest';
import { describe, expect, it } from 'vitest';
import handler from '../../api/[...path]';

describe('función API de Vercel', () => {
  it('responde al health check por la ruta pública', async () => {
    const response = await request(handler).get('/api/health');

    expect(response.status).toBe(200);
    expect(response.body).toEqual({ ok: true });
  });
});
