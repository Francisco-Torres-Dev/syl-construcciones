// Crea o promueve un administrador de forma controlada (solo desde la línea de comandos).
// Uso: ADMIN_EMAIL=... ADMIN_PASSWORD=... ADMIN_NAME=... npm run seed:admin
import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { hashPassword } from '../src/lib/auth';
import { passwordSchema } from '../src/lib/schemas';

const prisma = new PrismaClient();

async function main() {
  const email = process.env.ADMIN_EMAIL?.toLowerCase();
  const password = process.env.ADMIN_PASSWORD;
  if (!email || !password) throw new Error('Define ADMIN_EMAIL y ADMIN_PASSWORD.');
  passwordSchema.parse(password);
  const passwordHash = await hashPassword(password);
  const user = await prisma.user.upsert({
    where: { email },
    update: { role: 'ADMIN', passwordHash, emailVerifiedAt: new Date() },
    create: { email, name: process.env.ADMIN_NAME ?? 'Administrador', role: 'ADMIN', passwordHash, emailVerifiedAt: new Date() },
  });
  console.log(`Administrador listo: ${user.email}`);
}

main().catch((e) => { console.error(e.message); process.exit(1); }).finally(() => prisma.$disconnect());
