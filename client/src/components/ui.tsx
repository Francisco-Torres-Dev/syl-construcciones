import { AlertCircle, Loader2 } from 'lucide-react';
import type { ReactNode } from 'react';
import { Link, Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../lib/auth';

export const Spinner = ({ label = 'Cargando…' }: { label?: string }) => (
  <div className="flex items-center justify-center gap-2 py-16 text-steel" role="status"><Loader2 className="h-5 w-5 animate-spin" />{label}</div>
);

export const ErrorBox = ({ children }: { children: ReactNode }) => (
  <div role="alert" className="flex items-start gap-2 rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-800"><AlertCircle className="mt-0.5 h-4 w-4 shrink-0" /><div>{children}</div></div>
);

export const Empty = ({ title, action }: { title: string; action?: ReactNode }) => (
  <div className="rounded-lg border border-dashed border-graphite/20 p-10 text-center"><p className="font-display text-lg font-semibold">{title}</p>{action && <div className="mt-4">{action}</div>}</div>
);

export function Protected({ children, admin }: { children: ReactNode; admin?: boolean }) {
  const { user, loading } = useAuth();
  const loc = useLocation();
  if (loading) return <Spinner />;
  if (!user) return <Navigate to="/ingresar" state={{ from: loc.pathname }} replace />;
  if (admin && user.role !== 'ADMIN') return <Navigate to="/cuenta" replace />;
  return <>{children}</>;
}

export const PageHead = ({ title, intro }: { title: string; intro?: string }) => (
  <div className="bg-ink pb-14 pt-32 text-white grid-lines">
    <div className="container-x"><h1 className="max-w-3xl text-4xl font-extrabold sm:text-5xl">{title}</h1>{intro && <p className="mt-4 max-w-2xl text-lg text-white/70">{intro}</p>}
      <div className="mt-6 h-1 w-16 bg-brand" /></div>
  </div>
);

export const QuoteLink = ({ slug, className = 'btn-primary', children = 'Solicitar cotización' }: { slug?: string; className?: string; children?: ReactNode }) => (
  <Link to={slug ? `/cotizar?servicio=${slug}` : '/cotizar'} className={className}>{children}</Link>
);
