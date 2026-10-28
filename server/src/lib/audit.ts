import { prisma } from './prisma';

export const audit = (actorId: string | null, action: string, entity: string, entityId: string, meta?: object) =>
  prisma.auditLog.create({ data: { actorId, action, entity, entityId, meta: meta ? JSON.stringify(meta) : null } });

export const notify = (userId: string, title: string, body: string) =>
  prisma.notification.create({ data: { userId, title, body } });
