import { PrismaClient } from '@prisma/client';
import { slugify } from '../src/lib/code';

const prisma = new PrismaClient();

async function main() {
  const demos = [
    ['Ejemplo: ampliación de vivienda', 'Construcción'],
    ['Ejemplo: cobertizo para vehículos', 'Techumbres'],
    ['Ejemplo: remodelación de cocina', 'Remodelación'],
    ['Ejemplo: habilitación de cafetería', 'Locales comerciales'],
  ];

  for (const [i, [title, category]] of demos.entries()) {
    await prisma.project.upsert({
      where: { slug: slugify(title) },
      update: {},
      create: {
        slug: slugify(title),
        title,
        category,
        isDemo: true,
        published: true,
        sortOrder: i,
        description: 'Proyecto de demostración. Reemplázalo desde el panel de administración por una obra real con sus fotografías.',
      },
    });
  }
  console.log('Seed de proyectos de demostración completado.');
}

main().finally(() => prisma.$disconnect());
