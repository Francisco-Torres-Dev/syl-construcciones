# S&L Construcciones — Plataforma web

Sitio público, cotizaciones con adjuntos, cuentas de cliente, acceso con Google y panel de administración.

**Stack:** React + TypeScript + Vite + Tailwind + Motion · Node + Express + TypeScript · PostgreSQL gestionado + Prisma · Zod.

```
sl-construcciones/
├─ client/   Frontend (Vite). Logos en client/public/brand
└─ server/   API (Express + Prisma). Esquema en server/prisma/schema.prisma
```

---

## 1. Estado real del proyecto

| Área | Estado |
|---|---|
| Logos SVG + PNG, favicon | Generados y revisados (`npm run logos` en `client`) |
| Frontend: tipos y compilación de producción | Verificado (`tsc` y `vite build` sin errores) |
| API: pruebas automatizadas (validación y control de acceso, con base simulada) | 15/15 pasan |
| API y base de datos | API compatible con Vercel Functions; PostgreSQL se configura mediante variables de entorno |
| Imágenes de servicios | Ilustraciones SVG locales, independientes de las fotos reales del portafolio |
| Google OAuth, correo SMTP, almacenamiento S3 | Implementados; requieren tus credenciales (sección 4) |
| Catálogo público | Servicios y proyectos locales del frontend; sus páginas no dependen de la base de datos |

Las cuentas nuevas se guardan en PostgreSQL. Para entrar como administrador, inicia sesión en `/ingresar`; una cuenta con rol ADMIN se dirige al panel `/admin`. La lista de personas registradas está en `/admin/clientes`.

---

## 2. Puesta en marcha en Windows (PowerShell)

Requisitos: Node.js 20+ y una instancia PostgreSQL gestionada (por ejemplo, Neon). No se necesita instalar PostgreSQL en el equipo.

```powershell
# 1) Dependencias
cd sl-construcciones
npm run install:all

# 2) Variables de entorno
Copy-Item server\.env.example server\.env
Copy-Item client\.env.example client\.env
# Edita server\.env con DATABASE_URL (pool de conexiones) y DIRECT_URL (conexión directa).
# Para producción, define un JWT_SECRET propio. Para generar uno:
node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"

# 3) Inicializar el esquema PostgreSQL
cd server
npx prisma generate
npm run db:setup

# 4) Crear el primer administrador (solo por línea de comandos; nunca desde la web)
$env:ADMIN_EMAIL="tu@correo.cl"; $env:ADMIN_PASSWORD="UnaClaveLarga123"; $env:ADMIN_NAME="Tu Nombre"
npm run seed:admin
cd ..

# 5) Ejecutar (dos terminales)
npm run dev:server      # API en http://localhost:4000
npm run dev:client      # Web en http://localhost:5173
```

El comando `npm run dev` de la API sincroniza el esquema PostgreSQL al iniciar. Panel de administración: `http://localhost:5173/admin` (ingresa con el administrador creado); selecciona **Personas registradas** para consultar las cuentas.

### Pruebas
```powershell
npm test
```

### Docker Compose (PostgreSQL local)
```powershell
Copy-Item .env.example .env
# Cambia POSTGRES_PASSWORD y JWT_SECRET por valores aleatorios antes de iniciar.
docker compose up -d --build
```

---

## 3. Qué incluye

- **Público:** inicio animado (respeta `prefers-reduced-motion`), catálogo local con 8 servicios e ilustraciones propias (alcance, trabajos incluidos, FAQ, relacionados), proyectos con filtro y fotografías reales, botón de WhatsApp, Nosotros, Consejos, Contacto, FAQ, políticas.
- **Cotización:** validación en cliente y servidor, adjuntos con vista previa (JPG/PNG/WEBP/PDF, 8 MB, máx. 8; se verifica la firma real del archivo), código único `SL-AAAA-XXXXXX`, anti doble envío, se asocia a la cuenta si hay sesión. Si el servidor falla, **no** se muestra éxito.
- **Cuentas:** registro, login, Google, recuperación de contraseña, verificación de correo (opcional), perfil, protección de rutas.
- **Panel del cliente:** resumen, datos, solicitudes con estado, cotizaciones recibidas y notificaciones. Solo ve lo propio.
- **Panel admin:** indicadores, búsqueda y filtros de cotizaciones, notas internas, cambio de estado, propuesta económica, historial, personas registradas y configuración.
- **Seguridad:** hash bcrypt, cookie `httpOnly` + `SameSite=Lax` (+ `Secure` en producción), encabezado anti-CSRF, CORS restrictivo, Helmet, límites de peticiones, validación Zod, ORM, rol siempre leído desde la base de datos, propiedad verificada en cada recurso, adjuntos solo para su dueño o admin, auditoría de acciones administrativas.
- **Roles:** `CLIENT` y `ADMIN` (modelo simple). El rol se verifica desde PostgreSQL en cada petición protegida.

---

## 4. Configuración externa pendiente

**Google OAuth**
1. Google Cloud Console → APIs y servicios → Credenciales → *ID de cliente OAuth* (aplicación web).
2. Orígenes autorizados: `http://localhost:5173` y tu dominio.
3. Copia el ID en `GOOGLE_CLIENT_ID` (server/.env). Sin esto el botón muestra “aún no está configurado”.

**Correo (SMTP / transaccional)** — completa `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `MAIL_FROM`, `ADMIN_NOTIFY_EMAIL`. Sin SMTP, los correos **no se envían** y el servidor lo registra en el log. Verifica el dominio de envío (SPF/DKIM) con tu proveedor.

**Almacenamiento** — por defecto guarda en `server/uploads` (solo desarrollo). Para producción usa S3 o compatible (R2, MinIO): `STORAGE_DRIVER=s3` y las variables `S3_*`. El bucket debe ser **privado**; la API sirve los archivos con control de acceso. El sistema de archivos de Vercel es efímero, por lo que los adjuntos subidos requieren este almacenamiento externo.

**WhatsApp, teléfono, redes, cobertura, horarios** — Admin → Configuración.

**Dominio** — Actualiza `VITE_SITE_URL`, `client/public/sitemap.xml` y `robots.txt` cuando tengas el dominio de producción.

**Textos legales** — Privacidad y Términos son borradores base: deben revisarse con un abogado (Ley 19.628 y sus modificaciones).

---

## 5. Despliegue

1. Importa el repositorio de GitHub en Vercel. `vercel.json` publica `client` como frontend Vite y `server` como API Express, bajo el mismo dominio.
2. Crea una base PostgreSQL gestionada y configura en Vercel `DATABASE_URL` (URL de conexión/pool) y `DIRECT_URL` (URL directa), además de `JWT_SECRET` y `CLIENT_URL` con el dominio HTTPS del proyecto.
3. Inicializa el esquema con `npm run db:setup --prefix server` usando `DIRECT_URL`. Luego crea el administrador con `ADMIN_EMAIL`, `ADMIN_PASSWORD` y `ADMIN_NAME` definidos solo en el entorno de ejecución del comando `npm run seed:admin --prefix server`.
4. Para adjuntos permanentes en producción, configura `STORAGE_DRIVER=s3` y las variables `S3_*`. No subas valores secretos a GitHub.

## 6. Logos

`client/public/brand`: `sl-logo-horizontal` (.svg/.png), `sl-logo-square` (.svg/.png), `sl-logo-light.svg` (para fondos claros), `sl-logo-dark.svg` (para fondos oscuros), `sl-logo-square-dark.svg`, y `public/favicon.svg`. El texto está convertido a trazos para que se vea igual en cualquier equipo. Para regenerar: `cd client; npm run logos`.
