import { Bell, FileText, LogOut } from 'lucide-react';
import { useEffect, useState, type FormEvent } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Empty, ErrorBox, Spinner } from '../components/ui';
import { api, ApiError } from '../lib/api';
import { useAuth } from '../lib/auth';
import { clp, fdate, fdatetime, STATUS_LABEL, STATUS_STYLE } from '../lib/format';
import { useSeo } from '../lib/seo';
import type { User } from '../lib/types';

export const StatusBadge = ({ s }: { s: string }) => <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-semibold ${STATUS_STYLE[s]}`}>{STATUS_LABEL[s] ?? s}</span>;

type Row = { id: string; code: string; serviceName: string; description: string; status: string; createdAt: string; _count: { attachments: number }; quotations: { id: string }[] };
type Note = { id: string; title: string; body: string; read: boolean; createdAt: string };

export default function Account() {
  useSeo({ title: 'Mi cuenta', noindex: true });
  const { user, logout, setUser } = useAuth();
  const nav = useNavigate();
  const [rows, setRows] = useState<Row[] | null>(null);
  const [notes, setNotes] = useState<Note[]>([]);
  const [error, setError] = useState('');
  const [name, setName] = useState(user?.name ?? ''); const [phone, setPhone] = useState(user?.phone ?? '');
  const [saved, setSaved] = useState('');

  useEffect(() => {
    api<{ quotes: Row[] }>('/quotes/mine').then((r) => setRows(r.quotes)).catch((e: ApiError) => setError(e.message));
    api<{ notifications: Note[] }>('/quotes/notifications').then((r) => setNotes(r.notifications)).catch(() => {});
  }, []);

  async function save(e: FormEvent) {
    e.preventDefault(); setSaved('');
    try { const r = await api<{ user: User }>('/auth/me', { method: 'PATCH', json: { name, phone } }); setUser(r.user); setSaved('Datos guardados.'); } catch (er) { setSaved((er as ApiError).message); }
  }
  async function markRead() { await api('/quotes/notifications/read', { method: 'POST' }); setNotes(notes.map((n) => ({ ...n, read: true }))); }
  const unread = notes.filter((n) => !n.read).length;

  return (
    <div className="bg-mist pb-20 pt-28">
      <div className="container-x">
        <div className="flex flex-wrap items-center justify-between gap-3"><div><h1 className="text-3xl font-extrabold">Hola, {user?.name.split(' ')[0]}</h1><p className="text-steel">{user?.email}</p></div>
          <div className="flex gap-2"><Link to="/cotizar" className="btn-primary">Nueva solicitud</Link><button className="btn-outline" onClick={async () => { await logout(); nav('/'); }}><LogOut className="h-4 w-4" />Cerrar sesión</button></div></div>

        <div className="mt-8 grid gap-4 sm:grid-cols-3">
          {[['Solicitudes', rows?.length ?? '—'], ['Cotizaciones disponibles', rows ? rows.reduce((a, r) => a + r.quotations.length, 0) : '—'], ['Notificaciones sin leer', unread]].map(([l, v]) => <div key={l} className="card p-5"><p className="text-sm text-steel">{l}</p><p className="font-display text-3xl font-extrabold">{v}</p></div>)}
        </div>

        <div className="mt-8 grid gap-8 lg:grid-cols-[1.7fr_1fr]">
          <section>
            <h2 className="mb-3 text-xl font-bold">Mis solicitudes</h2>
            {error && <ErrorBox>{error}</ErrorBox>}
            {!rows && !error ? <Spinner /> : rows?.length === 0 ? <Empty title="Todavía no tienes solicitudes." action={<Link to="/cotizar" className="btn-primary">Solicitar cotización</Link>} /> : (
              <ul className="space-y-3">{rows?.map((r) => (
                <li key={r.id}><Link to={`/cuenta/solicitudes/${r.id}`} className="card block p-5 transition hover:border-brand">
                  <div className="flex flex-wrap items-center justify-between gap-2"><span className="font-display font-bold">{r.code}</span><StatusBadge s={r.status} /></div>
                  <p className="mt-1 text-sm font-medium">{r.serviceName}</p><p className="mt-1 line-clamp-2 text-sm text-steel">{r.description}</p>
                  <p className="mt-2 text-xs text-steel">{fdate(r.createdAt)}{r.quotations.length > 0 && <span className="ml-2 font-semibold text-brand-dark">· Cotización disponible</span>}</p></Link></li>))}</ul>)}
          </section>
          <div className="space-y-8">
            <section className="card p-6"><h2 className="mb-4 text-lg font-bold">Mis datos</h2>
              <form onSubmit={save} className="space-y-3"><div><label className="label" htmlFor="nm">Nombre</label><input id="nm" className="input" value={name} onChange={(e) => setName(e.target.value)} required /></div>
                <div><label className="label" htmlFor="ph">Teléfono</label><input id="ph" className="input" value={phone} onChange={(e) => setPhone(e.target.value)} /></div>
                <button className="btn-dark w-full">Guardar</button>{saved && <p className="text-sm text-steel" role="status">{saved}</p>}</form></section>
            <section className="card p-6"><div className="mb-3 flex items-center justify-between"><h2 className="flex items-center gap-2 text-lg font-bold"><Bell className="h-4 w-4" />Notificaciones</h2>{unread > 0 && <button onClick={markRead} className="text-xs text-brand-dark underline">Marcar como leídas</button>}</div>
              {notes.length === 0 ? <p className="text-sm text-steel">No tienes notificaciones.</p> : <ul className="space-y-3">{notes.slice(0, 6).map((n) => <li key={n.id} className={`text-sm ${n.read ? 'text-steel' : ''}`}><p className="font-semibold">{n.title}</p><p>{n.body}</p><p className="text-xs text-steel">{fdatetime(n.createdAt)}</p></li>)}</ul>}</section>
          </div>
        </div>
      </div>
    </div>
  );
}

export function AccountQuote() {
  useSeo({ title: 'Mi solicitud', noindex: true });
  const { id } = useParams();
  const [q, setQ] = useState<any>(null); // eslint-disable-line @typescript-eslint/no-explicit-any
  const [error, setError] = useState('');
  useEffect(() => { api<{ quote: any }>(`/quotes/mine/${id}`).then((r) => setQ(r.quote)).catch((e: ApiError) => setError(e.message)); }, [id]); // eslint-disable-line @typescript-eslint/no-explicit-any
  return (
    <div className="bg-mist pb-20 pt-28"><div className="container-x max-w-3xl">
      <Link to="/cuenta" className="text-sm text-brand-dark hover:underline">← Volver a mi cuenta</Link>
      {error && <div className="mt-6"><ErrorBox>{error}</ErrorBox></div>}{!q && !error && <Spinner />}
      {q && <div className="mt-4 space-y-6">
        <div className="card p-6"><div className="flex flex-wrap items-center justify-between gap-2"><h1 className="text-2xl font-extrabold">{q.code}</h1><StatusBadge s={q.status} /></div>
          <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-2"><div><dt className="text-steel">Servicio</dt><dd className="font-medium">{q.serviceName}</dd></div><div><dt className="text-steel">Creada</dt><dd className="font-medium">{fdate(q.createdAt)}</dd></div><div><dt className="text-steel">Comuna</dt><dd className="font-medium">{q.comuna}, {q.region}</dd></div><div><dt className="text-steel">Propiedad</dt><dd className="font-medium">{q.propertyType}</dd></div></dl>
          <p className="mt-4 whitespace-pre-wrap text-sm">{q.description}</p>
          {q.attachments.length > 0 && <ul className="mt-4 space-y-1 text-sm">{q.attachments.map((a: any) => <li key={a.id}><a className="inline-flex items-center gap-2 text-brand-dark hover:underline" href={`/api/files/attachments/${a.id}`} target="_blank" rel="noopener noreferrer"><FileText className="h-4 w-4" />{a.originalName}</a></li>)}</ul>}</div>
        {q.quotations.map((c: any) => { const total = c.items.reduce((s: number, i: any) => s + Number(i.quantity) * Number(i.unitPrice), 0); return (
          <div key={c.id} className="card p-6"><h2 className="text-xl font-bold">Cotización</h2><p className="text-xs text-steel">Enviada el {c.sentAt && fdate(c.sentAt)}</p>
            <table className="mt-4 w-full text-sm"><thead><tr className="border-b text-left text-steel"><th className="py-2">Ítem</th><th>Cant.</th><th className="text-right">Precio</th></tr></thead><tbody>{c.items.map((i: any) => <tr key={i.id} className="border-b border-graphite/5"><td className="py-2">{i.description}</td><td>{Number(i.quantity)}</td><td className="text-right">{clp(Number(i.quantity) * Number(i.unitPrice))}</td></tr>)}</tbody><tfoot><tr><td colSpan={2} className="pt-3 font-bold">Total</td><td className="pt-3 text-right font-bold">{clp(total)}</td></tr></tfoot></table>
            {[['Materiales', c.materials], ['Plazo', c.timeline], ['Condiciones', c.conditions], ['Exclusiones', c.exclusions]].filter(([, v]) => v).map(([l, v]) => <p key={l} className="mt-3 text-sm"><strong>{l}:</strong> {v}</p>)}</div>); })}
      </div>}
    </div></div>
  );
}
