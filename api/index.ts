import type { Request, Response } from 'express';
import { createApp } from '../server/src/app';

const app = createApp();

export default function handler(req: Request, res: Response) {
  const requestUrl = new URL(req.url ?? '/', 'http://localhost');
  const apiPath = requestUrl.searchParams.get('__vercel_path');

  if (apiPath) {
    requestUrl.searchParams.delete('__vercel_path');
    const query = requestUrl.searchParams.toString();
    req.url = `/api/${apiPath}${query ? `?${query}` : ''}`;
  }

  return app(req, res);
}
