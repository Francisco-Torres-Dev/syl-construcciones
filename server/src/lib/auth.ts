import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import type { Response } from 'express';
import { config } from '../config';

export const hashPassword = (p: string) => bcrypt.hash(p, 12);
export const verifyPassword = (p: string, hash: string) => bcrypt.compare(p, hash);
export const newToken = () => crypto.randomBytes(32).toString('hex');
export const sha256 = (s: string) => crypto.createHash('sha256').update(s).digest('hex');

export const signSession = (userId: string) => jwt.sign({ sub: userId }, config.jwtSecret, { expiresIn: '7d' });

export function readSession(token: string): string | null {
  try {
    const p = jwt.verify(token, config.jwtSecret) as { sub?: string };
    return p.sub ?? null;
  } catch {
    return null;
  }
}

const cookieOpts = () => ({ httpOnly: true, secure: config.isProd, sameSite: 'lax' as const, path: '/' });

export const setSessionCookie = (res: Response, userId: string) =>
  res.cookie(config.cookieName, signSession(userId), { ...cookieOpts(), maxAge: 7 * 24 * 3600 * 1000 });

export const clearSessionCookie = (res: Response) => res.clearCookie(config.cookieName, cookieOpts());
