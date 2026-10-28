import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { OAuth2Client } from 'google-auth-library';
import { config, emailConfigured, googleConfigured } from '../config';
import { clearSessionCookie, hashPassword, newToken, setSessionCookie, sha256, verifyPassword } from '../lib/auth';
import { HttpError, wrap } from '../lib/errors';
import { sendMail } from '../lib/mailer';
import { prisma } from '../lib/prisma';
import { loginSchema, profileSchema, registerSchema, resetSchema } from '../lib/schemas';
import { requireAuth } from '../middleware/auth';
import { z } from 'zod';

export const authRouter = Router();

const strict = rateLimit({ windowMs: 15 * 60 * 1000, limit: 20, standardHeaders: true, legacyHeaders: false, message: { error: 'Demasiados intentos. Espera unos minutos.' } });

const publicUser = (u: { id: string; email: string; name: string; phone: string | null; role: string; emailVerifiedAt: Date | null }) => ({
  id: u.id, email: u.email, name: u.name, phone: u.phone, role: u.role, emailVerified: Boolean(u.emailVerifiedAt),
});

authRouter.get('/config', (_req, res) => {
  res.json({ googleClientId: googleConfigured() ? config.google.clientId : null, emailConfigured: emailConfigured(), requireEmailVerification: config.requireEmailVerification });
});

authRouter.post('/register', strict, wrap(async (req, res) => {
  const data = registerSchema.parse(req.body);
  const exists = await prisma.user.findUnique({ where: { email: data.email } });
  if (exists) throw new HttpError(409, 'Ya existe una cuenta con ese correo.');
  const verifyToken = newToken();
  const user = await prisma.user.create({
    data: {
      email: data.email, name: data.name, phone: data.phone || null,
      passwordHash: await hashPassword(data.password),
      role: 'CLIENT', // el rol nunca proviene de la petición
      verifyTokenHash: sha256(verifyToken),
    },
  });
  const link = `${config.clientUrl}/verificar?token=${verifyToken}`;
  await sendMail(user.email, 'Confirma tu correo — S&L Construcciones', `Hola ${user.name},\n\nConfirma tu correo aquí:\n${link}\n`);
  if (config.requireEmailVerification) {
    return res.status(201).json({ needsVerification: true, message: 'Cuenta creada. Revisa tu correo para confirmarla antes de iniciar sesión.' });
  }
  setSessionCookie(res, user.id);
  res.status(201).json({ user: publicUser(user) });
}));

authRouter.post('/login', strict, wrap(async (req, res) => {
  const { email, password } = loginSchema.parse(req.body);
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user?.passwordHash || !(await verifyPassword(password, user.passwordHash))) {
    throw new HttpError(401, 'Correo o contraseña incorrectos.');
  }
  if (config.requireEmailVerification && !user.emailVerifiedAt) {
    throw new HttpError(403, 'Confirma tu correo antes de iniciar sesión.');
  }
  setSessionCookie(res, user.id);
  res.json({ user: publicUser(user) });
}));

authRouter.post('/google', strict, wrap(async (req, res) => {
  if (!googleConfigured()) throw new HttpError(503, 'El acceso con Google no está configurado.');
  const { credential } = z.object({ credential: z.string().min(20) }).parse(req.body);
  const client = new OAuth2Client(config.google.clientId);
  let payload;
  try {
    const ticket = await client.verifyIdToken({ idToken: credential, audience: config.google.clientId });
    payload = ticket.getPayload();
  } catch {
    throw new HttpError(401, 'No se pudo validar la cuenta de Google.');
  }
  if (!payload?.email || !payload.email_verified || !payload.sub) throw new HttpError(401, 'La cuenta de Google no tiene un correo verificado.');
  const email = payload.email.toLowerCase();
  let user = await prisma.user.findFirst({ where: { OR: [{ googleId: payload.sub }, { email }] } });
  if (!user) {
    user = await prisma.user.create({ data: { email, name: payload.name ?? email, googleId: payload.sub, emailVerifiedAt: new Date(), role: 'CLIENT' } });
  } else if (!user.googleId) {
    user = await prisma.user.update({ where: { id: user.id }, data: { googleId: payload.sub, emailVerifiedAt: user.emailVerifiedAt ?? new Date() } });
  }
  setSessionCookie(res, user.id);
  res.json({ user: publicUser(user) });
}));

authRouter.post('/logout', (_req, res) => {
  clearSessionCookie(res);
  res.json({ ok: true });
});

authRouter.get('/me', (req, res) => {
  if (!req.user) return res.json({ user: null });
  prisma.user.findUnique({ where: { id: req.user.id } }).then((u) => res.json({ user: u ? publicUser(u) : null }));
});

authRouter.patch('/me', requireAuth, wrap(async (req, res) => {
  const data = profileSchema.parse(req.body);
  const u = await prisma.user.update({ where: { id: req.user!.id }, data: { name: data.name, phone: data.phone || null } });
  res.json({ user: publicUser(u) });
}));

// Respuesta idéntica exista o no la cuenta, para no revelar qué correos están registrados.
authRouter.post('/forgot', strict, wrap(async (req, res) => {
  const { email } = z.object({ email: z.string().trim().toLowerCase().email() }).parse(req.body);
  const user = await prisma.user.findUnique({ where: { email } });
  if (user) {
    const token = newToken();
    await prisma.user.update({ where: { id: user.id }, data: { resetTokenHash: sha256(token), resetExpiresAt: new Date(Date.now() + 60 * 60 * 1000) } });
    await sendMail(user.email, 'Recupera tu contraseña — S&L Construcciones', `Usa este enlace (válido por 1 hora):\n${config.clientUrl}/restablecer?token=${token}\n\nSi no lo solicitaste, ignora este mensaje.`);
  }
  res.json({ message: 'Si el correo existe, te enviamos instrucciones para restablecer la contraseña.', emailConfigured: emailConfigured() });
}));

authRouter.post('/reset', strict, wrap(async (req, res) => {
  const { token, password } = resetSchema.parse(req.body);
  const user = await prisma.user.findFirst({ where: { resetTokenHash: sha256(token), resetExpiresAt: { gt: new Date() } } });
  if (!user) throw new HttpError(400, 'El enlace no es válido o ya expiró.');
  await prisma.user.update({ where: { id: user.id }, data: { passwordHash: await hashPassword(password), resetTokenHash: null, resetExpiresAt: null } });
  res.json({ message: 'Contraseña actualizada. Ya puedes iniciar sesión.' });
}));

authRouter.post('/verify', strict, wrap(async (req, res) => {
  const { token } = z.object({ token: z.string().min(20) }).parse(req.body);
  const user = await prisma.user.findFirst({ where: { verifyTokenHash: sha256(token) } });
  if (!user) throw new HttpError(400, 'El enlace de verificación no es válido.');
  await prisma.user.update({ where: { id: user.id }, data: { emailVerifiedAt: new Date(), verifyTokenHash: null } });
  res.json({ message: 'Correo confirmado.' });
}));
