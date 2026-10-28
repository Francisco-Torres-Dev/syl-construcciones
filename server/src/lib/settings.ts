import { prisma } from './prisma';

const LEGACY_DEFAULT_EMAIL = 'contacto@slconstrucciones.cl';

export type SiteSettings = {
  businessName: string; email: string; phone: string; whatsapp: string;
  coverage: string[]; hours: string; about: string;
  social: { instagram: string; facebook: string; linkedin: string };
  emailIsProvisional: boolean;
};

// Los datos de contacto entregados se usan como valores por defecto; los datos opcionales siguen vacíos.
export const DEFAULT_SETTINGS: Omit<SiteSettings, 'emailIsProvisional'> = {
  businessName: 'S&L Construcciones',
  email: 'adminsylconstrucciones@gmail.com',
  phone: '', whatsapp: '56995151856', coverage: [], hours: '', about: '',
  social: { instagram: '', facebook: '', linkedin: '' },
};

export async function getSettings(): Promise<SiteSettings> {
  const row = await prisma.setting.findUnique({ where: { key: 'site' } });
  const stored = (row ? JSON.parse(row.value) as Partial<SiteSettings> : {}) ?? {};
  const merged = { ...DEFAULT_SETTINGS, ...stored };
  if (!stored.email || stored.email === LEGACY_DEFAULT_EMAIL) merged.email = DEFAULT_SETTINGS.email;
  if (!stored.whatsapp) merged.whatsapp = DEFAULT_SETTINGS.whatsapp;
  return { ...merged, emailIsProvisional: false };
}
