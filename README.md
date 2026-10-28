# S&L Construcciones — Plataforma web

Sitio público, cotizaciones con adjuntos, cuentas de cliente, acceso con Google y panel de administración.

**Stack:** React + TypeScript + Vite + Tailwind + Motion · Node + Express + TypeScript · SQLite local + Prisma · Zod.

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
| API y base de datos | SQLite local; no requiere un servidor MySQL |
| Imágenes de servicios | Ilustraciones SVG locales, independientes de las fotos reales del portafolio |
| Google OAuth, correo SMTP, almacenamiento S3 | Implementados; requieren tus credenciales (sección 4) |
| Catálogo público | Servicios y proyectos locales del frontend; sus páginas no dependen de la base de datos |

Las cuentas nuevas se guardan en la base SQLite local. Para entrar como administrador, inicia sesión en `/ingresar`; una cuenta con rol ADMIN se dirige al panel `/admin`. La lista de personas registradas está en `/admin/clientes`.

---

## 2. Puesta en marcha en Windows (PowerShell)

Requisitos: Node.js 20+. No se necesita instalar ni levantar un servidor de base de datos.

```powershell
# 1) Dependencias
cd sl-construcciones
npm run install:all

# 2) Variables de entorno
Copy-Item server\.env.example server\.env
Copy-Item client\.env.example client\.env
# SQLite se guarda en server/prisma/sl-construcciones.db.
# Para producción, define un JWT_SECRET propio. Para generar uno:
node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"

# 3) Inicializar el esquema SQLite
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

El comando `npm run dev` de la API crea o actualiza el archivo SQLite automáticamente. Panel de administración: `http://localhost:5173/admin` (ingresa con el administrador creado); selecciona **Personas registradas** para consultar las cuentas.

### Pruebas
```powershell
npm test
```

---

## 3. Qué incluye

- **Público:** inicio animado (respeta `prefers-reduced-motion`), catálogo local con 8 servicios e ilustraciones propias (alcance, trabajos incluidos, FAQ, relacionados), proyectos con filtro y fotografías reales, botón de WhatsApp, Nosotros, Consejos, Contacto, FAQ, políticas.
- **Cotización:** validación en cliente y servidor, adjuntos con vista previa (JPG/PNG/WEBP/PDF, 8 MB, máx. 8; se verifica la firma real del archivo), código único `SL-AAAA-XXXXXX`, anti doble envío, se asocia a la cuenta si hay sesión. Si el servidor falla, **no** se muestra éxito.
- **Cuentas:** registro, login, Google, recuperación de contraseña, verificación de correo (opcional), perfil, protección de rutas.
- **Panel del cliente:** resumen, datos, solicitudes con estado, cotizaciones recibidas y notificaciones. Solo ve lo propio.
- **Panel admin:** indicadores, búsqueda y filtros de cotizaciones, notas internas, cambio de estado, propuesta económica, historial, personas registradas y configuración.
- **Seguridad:** hash bcrypt, cookie `httpOnly` + `SameSite=Lax` (+ `Secure` en producción), encabezado anti-CSRF, CORS restrictivo, Helmet, límites de peticiones, validación Zod, ORM, rol siempre leído desde la base de datos, propiedad verificada en cada recurso, adjuntos solo para su dueño o admin, auditoría de acciones administrativas.
- **Roles:** `CLIENT` y `ADMIN` (modelo simple). El rol se verifica desde SQLite en cada petición protegida.

---

## 4. Configuración externa pendiente

**Google OAuth**
1. Google Cloud Console → APIs y servicios → Credenciales → *ID de cliente OAuth* (aplicación web).
2. Orígenes autorizados: `http://localhost:5173` y tu dominio.
3. Copia el ID en `GOOGLE_CLIENT_ID` (server/.env). Sin esto el botón muestra “aún no está configurado”.

**Correo (SMTP / transaccional)** — completa `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `MAIL_FROM`, `ADMIN_NOTIFY_EMAIL`. Sin SMTP, los correos **no se envían** y el servidor lo registra en el log. Verifica el dominio de envío (SPF/DKIM) con tu proveedor.

**Almacenamiento** — por defecto guarda en `server/uploads` (solo desarrollo). Para producción usa S3 o compatible (R2, MinIO): `STORAGE_DRIVER=s3` y las variables `S3_*`. El bucket debe ser **privado**; la API sirve los archivos con control de acceso.

**WhatsApp, teléfono, redes, cobertura, horarios** — Admin → Configuración.

**Dominio** — Actualiza `VITE_SITE_URL`, `client/public/sitemap.xml` y `robots.txt` cuando tengas el dominio de producción.

**Textos legales** — Privacidad y Términos son borradores base: deben revisarse con un abogado (Ley 19.628 y sus modificaciones).

---

## 5. Despliegue

1. `npm run build` (compila API en `server/dist` y web en `client/dist`).
2. API: `NODE_ENV=production`, `CLIENT_URL` con tu dominio HTTPS, `JWT_SECRET` fuerte y `npm run db:setup` desde `server`; ejecuta `node server/dist/index.js` detrás de un proxy HTTPS.
3. Web: sirve `client/dist` como sitio estático y haz que `/api` apunte a la API (mismo dominio mediante proxy inverso, necesario para la cookie de sesión), con *fallback* a `index.html` para las rutas de React.
4. Usa almacenamiento persistente para el archivo SQLite (por defecto `server/prisma/sl-construcciones.db`) y para `server/uploads`; respalda ambos. En producción, SQLite debe estar en un disco persistente accesible a una sola instancia de la API. Vercel no ofrece ese disco persistente para una SQLite local; para publicar el frontend allí y conservar cuentas/cotizaciones, aloja la API en un servicio con disco persistente y enruta `/api` hacia esa API, o migra a una base de datos gestionada.

## 6. Logos

`client/public/brand`: `sl-logo-horizontal` (.svg/.png), `sl-logo-square` (.svg/.png), `sl-logo-light.svg` (para fondos claros), `sl-logo-dark.svg` (para fondos oscuros), `sl-logo-square-dark.svg`, y `public/favicon.svg`. El texto está convertido a trazos para que se vea igual en cualquier equipo. Para regenerar: `cd client; npm run logos`.
