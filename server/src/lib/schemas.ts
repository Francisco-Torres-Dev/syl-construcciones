import { z } from 'zod';

export const passwordSchema = z
  .string()
  .min(10, 'La contraseña debe tener al menos 10 caracteres.')
  .max(128)
  .regex(/[A-Za-z]/, 'Incluye al menos una letra.')
  .regex(/[0-9]/, 'Incluye al menos un número.');

export const registerSchema = z.object({
  name: z.string().trim().min(2, 'Ingresa tu nombre.').max(120),
  email: z.string().trim().toLowerCase().email('Correo inválido.'),
  phone: z.string().trim().max(30).optional().or(z.literal('')),
  password: passwordSchema,
});

export const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email(),
  password: z.string().min(1).max(128),
});

export const profileSchema = z.object({
  name: z.string().trim().min(2).max(120),
  phone: z.string().trim().max(30).optional().or(z.literal('')),
});

export const resetSchema = z.object({ token: z.string().min(20), password: passwordSchema });

export const phoneRegex = /^\+?[0-9 ()-]{8,20}$/;

export const quoteSchema = z.object({
  fullName: z.string().trim().min(3, 'Ingresa tu nombre completo.').max(120),
  email: z.string().trim().toLowerCase().email('Correo inválido.'),
  phone: z.string().trim().regex(phoneRegex, 'Teléfono inválido.'),
  region: z.string().trim().min(2, 'Selecciona tu región.').max(80),
  comuna: z.string().trim().min(2, 'Ingresa tu comuna.').max(80),
  serviceSlug: z.string().trim().max(160).optional().or(z.literal('')),
  serviceName: z.string().trim().min(2, 'Selecciona un tipo de servicio.').max(160),
  propertyType: z.string().trim().min(2, 'Selecciona el tipo de propiedad.').max(60),
  description: z.string().trim().min(20, 'Describe tu proyecto (mínimo 20 caracteres).').max(4000),
  dimensions: z.string().trim().max(200).optional().or(z.literal('')),
  budget: z.string().trim().max(60).optional().or(z.literal('')),
  tentativeDate: z.string().trim().optional().or(z.literal('')),
  contactPref: z.enum(['email', 'telefono', 'whatsapp']),
  privacyAccepted: z.union([z.literal('true'), z.literal(true)], {
    errorMap: () => ({ message: 'Debes aceptar la política de privacidad.' }),
  }),
});

export const statusSchema = z.object({
  status: z.enum(['NUEVA', 'EN_REVISION', 'PENDIENTE_INFORMACION', 'COTIZACION_ENVIADA', 'ACEPTADA', 'RECHAZADA', 'FINALIZADA']),
});

export const noteSchema = z.object({ body: z.string().trim().min(1).max(3000) });

export const quotationSchema = z.object({
  materials: z.string().max(4000).optional().default(''),
  timeline: z.string().max(300).optional().default(''),
  conditions: z.string().max(4000).optional().default(''),
  exclusions: z.string().max(4000).optional().default(''),
  send: z.boolean().optional().default(false),
  items: z
    .array(
      z.object({
        description: z.string().trim().min(1).max(300),
        quantity: z.number().positive().max(1_000_000),
        unitPrice: z.number().nonnegative().max(10_000_000_000),
      }),
    )
    .min(1, 'Agrega al menos un ítem.')
    .max(100),
});

export const serviceSchema = z.object({
  name: z.string().trim().min(2).max(160),
  slug: z.string().trim().max(160).optional(),
  summary: z.string().trim().min(2).max(300),
  description: z.string().trim().min(2).max(6000),
  scope: z.string().trim().max(4000).default(''),
  includes: z.array(z.string().trim().min(1).max(200)).max(30).default([]),
  faqs: z.array(z.object({ q: z.string().min(1).max(300), a: z.string().min(1).max(2000) })).max(20).default([]),
  info: z.string().max(4000).optional().nullable(),
  categoryId: z.string().min(1),
  published: z.boolean().default(true),
  sortOrder: z.number().int().default(0),
});

export const categorySchema = z.object({
  name: z.string().trim().min(2).max(120),
  slug: z.string().trim().max(120).optional(),
  description: z.string().trim().max(1000).default(''),
  sortOrder: z.number().int().default(0),
  published: z.boolean().default(true),
});

export const projectSchema = z.object({
  title: z.string().trim().min(2).max(160),
  slug: z.string().trim().max(160).optional(),
  category: z.string().trim().min(2).max(80),
  description: z.string().trim().min(2).max(6000),
  isDemo: z.boolean().default(false),
  published: z.boolean().default(false),
  sortOrder: z.number().int().default(0),
});

export const settingsSchema = z.object({
  businessName: z.string().trim().min(2).max(120),
  email: z.string().trim().max(160).default(''),
  phone: z.string().trim().max(40).default(''),
  whatsapp: z.string().trim().regex(/^[0-9]{8,15}$/, 'Solo dígitos con código de país, ej. 56912345678.').or(z.literal('')).default(''),
  coverage: z.array(z.string().trim().min(1).max(120)).max(50).default([]),
  hours: z.string().trim().max(300).default(''),
  social: z.object({ instagram: z.string().max(200).default(''), facebook: z.string().max(200).default(''), linkedin: z.string().max(200).default('') })
    .default({ instagram: '', facebook: '', linkedin: '' }),
  about: z.string().trim().max(3000).default(''),
});
