export const STATUS_LABEL: Record<string, string> = {
  NUEVA: 'Nueva',
  EN_REVISION: 'En revisión',
  PENDIENTE_INFORMACION: 'Pendiente de información',
  COTIZACION_ENVIADA: 'Cotización enviada',
  ACEPTADA: 'Aceptada',
  RECHAZADA: 'Rechazada',
  FINALIZADA: 'Finalizada',
};
export const STATUSES = Object.keys(STATUS_LABEL);

export const STATUS_STYLE: Record<string, string> = {
  NUEVA: 'bg-brand/15 text-brand-dark',
  EN_REVISION: 'bg-blue-100 text-blue-800',
  PENDIENTE_INFORMACION: 'bg-amber-100 text-amber-800',
  COTIZACION_ENVIADA: 'bg-indigo-100 text-indigo-800',
  ACEPTADA: 'bg-emerald-100 text-emerald-800',
  RECHAZADA: 'bg-red-100 text-red-800',
  FINALIZADA: 'bg-graphite/10 text-graphite',
};

export const clp = (n: number | string) => new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP', maximumFractionDigits: 0 }).format(Number(n));
export const fdate = (d: string | Date) => new Date(d).toLocaleDateString('es-CL', { day: '2-digit', month: 'short', year: 'numeric' });
export const fdatetime = (d: string | Date) => new Date(d).toLocaleString('es-CL', { dateStyle: 'short', timeStyle: 'short' });
