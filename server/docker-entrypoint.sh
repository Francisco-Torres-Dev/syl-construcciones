#!/bin/sh
set -e
echo "Esperando a la base de datos y creando tablas..."
i=0
until npx prisma db push --skip-generate; do
  i=$((i+1))
  if [ "$i" -ge 40 ]; then echo "La base de datos no respondio tras varios intentos."; exit 1; fi
  echo "Reintentando en 3 s ($i/40)..."
  sleep 3
done
echo "Cargando catalogo y proyectos de demostracion..."
npx tsx prisma/seed.ts
if [ -n "$ADMIN_EMAIL" ] && [ -n "$ADMIN_PASSWORD" ]; then
  echo "Creando administrador..."
  npx tsx prisma/create-admin.ts
fi
exec npx tsx src/index.ts
