/* eslint-disable @typescript-eslint/no-explicit-any */
import { BarChart3, LayoutDashboard, LogOut, Plus, Settings as Cog, Trash2, Users } from 'lucide-react';
import { useCallback, useEffect, useState, type FormEvent, type ReactNode } from 'react';
import { Link, NavLink, Outlet, useNavigate, useParams } from 'react-router-dom';
import { Empty, ErrorBox, Spinner } from '../components/ui';
import { api, ApiError } from '../lib/api';
import { useAuth } from '../lib/auth';
import { clp, fdate, fdatetime, STATUS_LABEL, STATUSES } from '../lib/format';
import { useSeo } from '../lib/seo';
import { StatusBadge } from './Account';

function useLoad<T>(path: string) {
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState('');
  const reload = useCallback(() => { api<T>(path).then(setData).catch((e: ApiError) => setError(e.message)); }, [path]);
  useEffect(() => { setData(null); setError(''); reload(); }, [reload]);
  return { data, error, reload };
}

const NAV = [['/admin', 'Resumen', LayoutDashboard], ['/admin/solicitudes', 'Cotizaciones', BarChart3], ['/admin/clientes', 'Personas registradas', Users], ['/admin/configuracion', 'Configuración', Cog]] as const;

export function AdminLayout() {
  useSeo({ title: 'Administración', noindex: true });
  const { logout } = useAuth(); const nav = useNavigate();
  return (
    <div className="min-h-screen bg-mist lg:flex">
      <aside className="bg-ink text-white lg:fixed lg:inset-y-0 lg:w-60">
        <div className="flex items-center justify-between p-4 lg:block"><Link to="/"><img src="/brand/sl-logo-dark.svg" alt="S&L Construcciones" className="h-8" /></Link><p className="mt-2 hidden text-xs text-white/50 lg:block">Panel de administración</p></div>
        <nav aria-label="Administración" className="flex gap-1 overflow-x-auto px-2 pb-3 lg:flex-col lg:px-3">
          {NAV.map(([to, l, Icon]) => <NavLink key={to} to={to} end={to === '/admin'} className={({ isActive }) => `flex shrink-0 items-center gap-2 rounded-md px-3 py-2 text-sm ${isActive ? 'bg-brand text-ink' : 'text-white/70 hover:bg-white/10'}`}><Icon className="h-4 w-4" />{l}</NavLink>)}
          <button onClick={async () => { await logout(); nav('/'); }} className="flex shrink-0 items-center gap-2 rounded-md px-3 py-2 text-sm text-white/70 hover:bg-white/10 lg:mt-6"><LogOut className="h-4 w-4" />Salir</button>
        </nav>
      </aside>
      <main className="min-w-0 flex-1 p-5 sm:p-8 lg:ml-60"><Outlet /></main>
    </div>
  );
}

const H = ({ children, action }: { children: ReactNode; action?: ReactNode }) => <div className="mb-6 flex flex-wrap items-center justify-between gap-3"><h1 className="text-2xl font-extrabold">{children}</h1>{action}</div>;

export function AdminDashboard() {
  const { data, error } = useLoad<Record<string, number>>('/admin/stats');
  const cards = [['Total de solicitudes', 'total'], ['Nuevas', 'nuevas'], ['Pendientes', 'pendientes'], ['Cotizaciones enviadas', 'enviadas'], ['Proyectos aceptados', 'aceptadas'], ['Trabajos finalizados', 'finalizadas']];
  return (<><H>Resumen</H>{error && <ErrorBox>{error}</ErrorBox>}{!data && !error ? <Spinner /> : data && <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">{cards.map(([l, k]) => <div key={k} className="card p-6"><p className="text-sm text-steel">{l}</p><p className="font-display text-4xl font-extrabold">{data[k]}</p></div>)}</div>}
    <p className="mt-6 text-xs text-steel">Cifras calculadas en vivo desde la base de datos.</p></>);
}

// ---------- Cotizaciones ----------
export function AdminQuotes() {
  const [f, setF] = useState({ q: '', status: '', service: '', comuna: '', from: '', to: '' });
  const [page, setPage] = useState(1);
  const qs = new URLSearchParams({ page: String(page), ...Object.fromEntries(Object.entries(f).filter(([, v]) => v)) }).toString();
  const { data, error } = useLoad<{ items: any[]; total: number; pageSize: number }>(`/admin/quotes?${qs}`);
  const set = (k: keyof typeof f) => (e: any) => { setPage(1); setF({ ...f, [k]: e.target.value }); };
  const pages = data ? Math.max(1, Math.ceil(data.total / data.pageSize)) : 1;
  return (<><H>Cotizaciones</H>
    <div className="card mb-4 grid gap-3 p-4 sm:grid-cols-2 lg:grid-cols-6">
      <input aria-label="Buscar" className="input lg:col-span-2" placeholder="Buscar por nombre, correo o código" value={f.q} onChange={set('q')} />
      <select aria-label="Estado" className="input" value={f.status} onChange={set('status')}><option value="">Todos los estados</option>{STATUSES.map((s) => <option key={s} value={s}>{STATUS_LABEL[s]}</option>)}</select>
      <input aria-label="Servicio" className="input" placeholder="Servicio (nombre exacto)" value={f.service} onChange={set('service')} />
      <input aria-label="Comuna" className="input" placeholder="Comuna" value={f.comuna} onChange={set('comuna')} />
      <div className="flex gap-2"><input aria-label="Desde" type="date" className="input" value={f.from} onChange={set('from')} /><input aria-label="Hasta" type="date" className="input" value={f.to} onChange={set('to')} /></div>
    </div>
    {error && <ErrorBox>{error}</ErrorBox>}{!data && !error ? <Spinner /> : data && (data.items.length === 0 ? <Empty title="No hay solicitudes con esos filtros." /> : <>
      <div className="card overflow-x-auto"><table className="w-full min-w-[720px] text-sm"><thead><tr className="border-b text-left text-steel"><th className="p-3">Código</th><th>Cliente</th><th>Servicio</th><th>Comuna</th><th>Estado</th><th>Fecha</th></tr></thead>
        <tbody>{data.items.map((r) => <tr key={r.id} className="border-b border-graphite/5 hover:bg-mist"><td className="p-3"><Link className="font-semibold text-brand-dark hover:underline" to={`/admin/solicitudes/${r.id}`}>{r.code}</Link></td><td>{r.fullName}<br /><span className="text-xs text-steel">{r.email}</span></td><td>{r.serviceName}</td><td>{r.comuna}</td><td><StatusBadge s={r.status} /></td><td>{fdate(r.createdAt)}</td></tr>)}</tbody></table></div>
      <div className="mt-4 flex items-center justify-between text-sm"><span className="text-steel">{data.total} solicitudes</span><div className="flex items-center gap-2"><button className="btn-outline px-3 py-1.5" disabled={page <= 1} onClick={() => setPage(page - 1)}>Anterior</button><span>{page} / {pages}</span><button className="btn-outline px-3 py-1.5" disabled={page >= pages} onClick={() => setPage(page + 1)}>Siguiente</button></div></div></>)}</>);
}

export function AdminQuoteDetail() {
  const { id } = useParams();
  const { data, error, reload } = useLoad<{ quote: any; history: any[] }>(`/admin/quotes/${id}`);
  const [note, setNote] = useState(''); const [msg, setMsg] = useState('');
  const [items, setItems] = useState([{ description: '', quantity: 1, unitPrice: 0 }]);
  const [qf, setQf] = useState({ materials: '', timeline: '', conditions: '', exclusions: '' });

  const act = async (fn: () => Promise<unknown>, ok: string) => { setMsg(''); try { await fn(); setMsg(ok); reload(); } catch (e) { setMsg((e as ApiError).message); } };
  if (error) return <ErrorBox>{error}</ErrorBox>; if (!data) return <Spinner />;
  const q = data.quote;
  const total = items.reduce((s, i) => s + Number(i.quantity) * Number(i.unitPrice), 0);
  const upd = (i: number, k: string, v: any) => setItems(items.map((it, j) => (j === i ? { ...it, [k]: v } : it)));
  const sendQuotation = (send: boolean) => act(() => api(`/admin/quotes/${id}/quotations`, { json: { ...qf, send, items: items.map((i) => ({ ...i, quantity: Number(i.quantity), unitPrice: Number(i.unitPrice) })) } }), send ? 'Cotización enviada al cliente.' : 'Borrador guardado.');

  return (<><Link to="/admin/solicitudes" className="text-sm text-brand-dark hover:underline">← Cotizaciones</Link>
    <H action={<StatusBadge s={q.status} />}>{q.code}</H>
    {msg && <p role="status" className="mb-4 rounded-md bg-white p-3 text-sm shadow-sm">{msg}</p>}
    <div className="grid gap-6 xl:grid-cols-[1.5fr_1fr]">
      <div className="space-y-6">
        <section className="card p-6"><h2 className="mb-3 font-bold">Solicitud</h2>
          <dl className="grid gap-3 text-sm sm:grid-cols-2">{[['Cliente', q.fullName], ['Correo', q.email], ['Teléfono', q.phone], ['Contacto preferido', q.contactPref], ['Ubicación', `${q.comuna}, ${q.region}`], ['Servicio', q.serviceName], ['Propiedad', q.propertyType], ['Dimensiones', q.dimensions || '—'], ['Presupuesto', q.budget || '—'], ['Fecha tentativa', q.tentativeDate ? fdate(q.tentativeDate) : '—'], ['Cuenta', q.user ? q.user.email : 'Sin cuenta']].map(([l, v]) => <div key={l}><dt className="text-steel">{l}</dt><dd className="font-medium">{v}</dd></div>)}</dl>
          <p className="mt-4 whitespace-pre-wrap text-sm">{q.description}</p>
          {q.attachments.length > 0 && <div className="mt-4"><h3 className="mb-2 text-sm font-semibold">Archivos adjuntos</h3><div className="flex flex-wrap gap-3">{q.attachments.map((a: any) => <a key={a.id} href={`/api/files/attachments/${a.id}`} target="_blank" rel="noopener noreferrer" className="rounded border border-graphite/15 px-3 py-1.5 text-xs hover:border-brand">{a.originalName}</a>)}</div></div>}</section>

        <section className="card p-6"><h2 className="mb-3 font-bold">Propuesta económica</h2>
          {q.quotations.map((c: any) => <div key={c.id} className="mb-3 rounded border border-graphite/10 p-3 text-sm"><p className="font-semibold">{c.status === 'ENVIADA' ? 'Enviada' : 'Borrador'} · {fdate(c.createdAt)} · {clp(c.items.reduce((s: number, i: any) => s + Number(i.quantity) * Number(i.unitPrice), 0))}</p></div>)}
          <div className="space-y-2">{items.map((it, i) => <div key={i} className="grid grid-cols-[1fr_70px_110px_32px] gap-2"><input aria-label="Descripción" className="input" placeholder="Descripción" value={it.description} onChange={(e) => upd(i, 'description', e.target.value)} /><input aria-label="Cantidad" type="number" min="0" className="input" value={it.quantity} onChange={(e) => upd(i, 'quantity', e.target.value)} /><input aria-label="Precio unitario" type="number" min="0" className="input" value={it.unitPrice} onChange={(e) => upd(i, 'unitPrice', e.target.value)} /><button aria-label="Quitar ítem" onClick={() => setItems(items.filter((_, j) => j !== i))} className="text-steel hover:text-red-600"><Trash2 className="h-4 w-4" /></button></div>)}</div>
          <button className="mt-2 text-sm text-brand-dark" onClick={() => setItems([...items, { description: '', quantity: 1, unitPrice: 0 }])}>+ Agregar ítem</button>
          <p className="mt-3 text-right font-bold">Total: {clp(total)}</p>
          <div className="mt-3 grid gap-3 sm:grid-cols-2">{([['materials', 'Materiales'], ['timeline', 'Plazo'], ['conditions', 'Condiciones'], ['exclusions', 'Exclusiones']] as const).map(([k, l]) => <div key={k}><label className="label">{l}</label><textarea rows={2} className="input" value={qf[k]} onChange={(e) => setQf({ ...qf, [k]: e.target.value })} /></div>)}</div>
          <div className="mt-4 flex gap-2"><button className="btn-outline" onClick={() => sendQuotation(false)}>Guardar borrador</button><button className="btn-primary" onClick={() => confirm('¿Enviar la cotización al cliente?') && sendQuotation(true)}>Enviar cotización</button></div></section>
      </div>

      <div className="space-y-6">
        <section className="card p-6"><h2 className="mb-3 font-bold">Estado</h2>
          <select aria-label="Estado" className="input" value={q.status} onChange={(e) => act(() => api(`/admin/quotes/${id}/status`, { method: 'PATCH', json: { status: e.target.value } }), 'Estado actualizado.')}>{STATUSES.map((s) => <option key={s} value={s}>{STATUS_LABEL[s]}</option>)}</select></section>
        <section className="card p-6"><h2 className="mb-3 font-bold">Notas internas</h2><p className="mb-2 text-xs text-steel">Solo visibles para el equipo.</p>
          <form onSubmit={(e: FormEvent) => { e.preventDefault(); if (note.trim()) act(async () => { await api(`/admin/quotes/${id}/notes`, { json: { body: note } }); setNote(''); }, 'Nota agregada.'); }}><textarea aria-label="Nueva nota" rows={3} className="input" value={note} onChange={(e) => setNote(e.target.value)} /><button className="btn-dark mt-2">Agregar nota</button></form>
          <ul className="mt-4 space-y-3 text-sm">{q.notes.map((n: any) => <li key={n.id}><p>{n.body}</p><p className="text-xs text-steel">{n.author.name} · {fdatetime(n.createdAt)}</p></li>)}</ul></section>
        <section className="card p-6"><h2 className="mb-3 font-bold">Historial</h2>{data.history.length === 0 ? <p className="text-sm text-steel">Sin cambios registrados.</p> : <ul className="space-y-2 text-sm">{data.history.map((h) => <li key={h.id}><span className="font-medium">{h.action.replace(/_/g, ' ').toLowerCase()}</span>{h.meta?.to && <> → {STATUS_LABEL[h.meta.to]}</>}<br /><span className="text-xs text-steel">{h.actor?.name ?? 'Sistema'} · {fdatetime(h.createdAt)}</span></li>)}</ul>}</section>
      </div></div></>);
}

// ---------- Servicios ----------
const emptySvc = { id: '', name: '', slug: '', summary: '', description: '', scope: '', includes: '', faqs: '', info: '', categoryId: '', published: true, sortOrder: 0 };
export function AdminServices() {
  const { data, error, reload } = useLoad<{ categories: any[]; services: any[] }>('/admin/services');
  const [form, setForm] = useState<any>(null); const [msg, setMsg] = useState('');
  const [cat, setCat] = useState({ name: '', description: '' });
  const edit = (s: any) => setForm({ ...s, info: s.info ?? '', includes: s.includes.join('\n'), faqs: s.faqs.map((f: any) => `${f.q} :: ${f.a}`).join('\n') });
  async function save(e: FormEvent) {
    e.preventDefault(); setMsg('');
    const body = { name: form.name, slug: form.slug || undefined, summary: form.summary, description: form.description, scope: form.scope, info: form.info || null, categoryId: form.categoryId, published: form.published, sortOrder: Number(form.sortOrder),
      includes: form.includes.split('\n').map((x: string) => x.trim()).filter(Boolean), faqs: form.faqs.split('\n').map((l: string) => l.split('::').map((x) => x.trim())).filter((p: string[]) => p[0] && p[1]).map(([q, a]: string[]) => ({ q, a })) };
    try { await api(form.id ? `/admin/services/${form.id}` : '/admin/services', { method: form.id ? 'PUT' : 'POST', json: body }); setForm(null); reload(); } catch (er) { setMsg((er as ApiError).message); }
  }
  if (error) return <ErrorBox>{error}</ErrorBox>; if (!data) return <Spinner />;
  const F = (k: string, label: string, area = false) => <div><label className="label">{label}</label>{area ? <textarea rows={3} className="input" value={form[k]} onChange={(e) => setForm({ ...form, [k]: e.target.value })} /> : <input className="input" value={form[k]} onChange={(e) => setForm({ ...form, [k]: e.target.value })} />}</div>;
  return (<><H action={<button className="btn-primary" onClick={() => setForm({ ...emptySvc, categoryId: data.categories[0]?.id ?? '' })}><Plus className="h-4 w-4" />Nuevo servicio</button>}>Servicios</H>
    {form && <form onSubmit={save} className="card mb-8 space-y-3 p-6"><h2 className="font-bold">{form.id ? 'Editar servicio' : 'Nuevo servicio'}</h2>
      <div className="grid gap-3 sm:grid-cols-2">{F('name', 'Nombre')}{F('slug', 'URL (opcional)')}</div>{F('summary', 'Resumen')}{F('description', 'Descripción', true)}{F('scope', 'Alcance general', true)}{F('includes', 'Trabajos incluidos (uno por línea)', true)}{F('faqs', 'Preguntas frecuentes (una por línea: Pregunta :: Respuesta)', true)}{F('info', 'Información relevante', true)}
      <div className="grid gap-3 sm:grid-cols-3"><div><label className="label">Categoría</label><select className="input" value={form.categoryId} onChange={(e) => setForm({ ...form, categoryId: e.target.value })}>{data.categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}</select></div>{F('sortOrder', 'Orden')}<label className="flex items-end gap-2 pb-2 text-sm"><input type="checkbox" checked={form.published} onChange={(e) => setForm({ ...form, published: e.target.checked })} />Publicado</label></div>
      {msg && <ErrorBox>{msg}</ErrorBox>}<div className="flex gap-2"><button className="btn-primary">Guardar</button><button type="button" className="btn-outline" onClick={() => setForm(null)}>Cancelar</button></div></form>}
    {data.categories.map((c) => <section key={c.id} className="mb-6"><h2 className="mb-2 font-bold">{c.name}</h2><div className="card divide-y divide-graphite/5">{data.services.filter((s) => s.categoryId === c.id).map((s) => <div key={s.id} className="flex flex-wrap items-center justify-between gap-2 p-4"><div><p className="font-medium">{s.name}</p><p className="text-xs text-steel">/{s.slug}</p></div><div className="flex items-center gap-2"><button className={`rounded-full px-3 py-1 text-xs font-semibold ${s.published ? 'bg-emerald-100 text-emerald-800' : 'bg-graphite/10'}`} onClick={async () => { await api(`/admin/services/${s.id}/published`, { method: 'PATCH', json: { published: !s.published } }); reload(); }}>{s.published ? 'Publicado' : 'Oculto'}</button><button className="btn-outline px-3 py-1.5" onClick={() => edit(s)}>Editar</button></div></div>)}</div></section>)}
    <form className="card flex flex-wrap items-end gap-3 p-4" onSubmit={async (e) => { e.preventDefault(); await api('/admin/categories', { json: cat }); setCat({ name: '', description: '' }); reload(); }}><div><label className="label">Nueva categoría</label><input required className="input" value={cat.name} onChange={(e) => setCat({ ...cat, name: e.target.value })} /></div><div className="flex-1"><label className="label">Descripción</label><input className="input" value={cat.description} onChange={(e) => setCat({ ...cat, description: e.target.value })} /></div><button className="btn-dark">Crear</button></form></>);
}

// ---------- Proyectos ----------
export function AdminProjects() {
  const { data, error, reload } = useLoad<{ projects: any[] }>('/admin/projects');
  const [form, setForm] = useState<any>(null); const [msg, setMsg] = useState('');
  async function save(e: FormEvent) { e.preventDefault(); setMsg(''); try { const { id, images, ...body } = form; await api(id ? `/admin/projects/${id}` : '/admin/projects', { method: id ? 'PUT' : 'POST', json: { ...body, sortOrder: Number(body.sortOrder) } }); setForm(null); reload(); } catch (er) { setMsg((er as ApiError).message); } }
  async function upload(p: any, files: FileList | null) { if (!files?.length) return; const fd = new FormData(); Array.from(files).forEach((f) => fd.append('files', f)); fd.append('alt', p.title); try { await api(`/admin/projects/${p.id}/images`, { form: fd }); reload(); } catch (e) { alert((e as ApiError).message); } }
  if (error) return <ErrorBox>{error}</ErrorBox>; if (!data) return <Spinner />;
  return (<><H action={<button className="btn-primary" onClick={() => setForm({ title: '', category: '', description: '', isDemo: false, published: false, sortOrder: 0 })}><Plus className="h-4 w-4" />Nuevo proyecto</button>}>Proyectos</H>
    {form && <form onSubmit={save} className="card mb-8 space-y-3 p-6"><div className="grid gap-3 sm:grid-cols-2"><div><label className="label">Título</label><input required className="input" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} /></div><div><label className="label">Categoría</label><input required className="input" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} /></div></div>
      <div><label className="label">Descripción</label><textarea required rows={4} className="input" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></div>
      <div className="flex flex-wrap gap-5 text-sm"><label className="flex items-center gap-2"><input type="checkbox" checked={form.published} onChange={(e) => setForm({ ...form, published: e.target.checked })} />Publicado</label><label className="flex items-center gap-2"><input type="checkbox" checked={form.isDemo} onChange={(e) => setForm({ ...form, isDemo: e.target.checked })} />Es un ejemplo de demostración</label></div>
      {msg && <ErrorBox>{msg}</ErrorBox>}<div className="flex gap-2"><button className="btn-primary">Guardar</button><button type="button" className="btn-outline" onClick={() => setForm(null)}>Cancelar</button></div></form>}
    {data.projects.length === 0 ? <Empty title="No hay proyectos todavía." /> : <div className="space-y-4">{data.projects.map((p) => <div key={p.id} className="card p-5"><div className="flex flex-wrap items-center justify-between gap-2"><div><p className="font-display font-bold">{p.title} {p.isDemo && <span className="ml-1 rounded bg-graphite/10 px-2 text-xs">Ejemplo</span>}</p><p className="text-xs text-steel">{p.category} · {p.published ? 'Publicado' : 'Borrador'}</p></div><div className="flex gap-2"><button className="btn-outline px-3 py-1.5" onClick={() => setForm(p)}>Editar</button><button className="btn-outline px-3 py-1.5 text-red-700" onClick={async () => { if (confirm('¿Eliminar el proyecto y sus imágenes?')) { await api(`/admin/projects/${p.id}`, { method: 'DELETE' }); reload(); } }}>Eliminar</button></div></div>
      <div className="mt-3 flex flex-wrap items-center gap-3">{p.images.map((im: any) => <div key={im.id} className="relative"><img src={`/api/project-images/${im.id}`} alt={im.alt} className="h-20 w-20 rounded object-cover" /><button aria-label="Eliminar imagen" onClick={async () => { await api(`/admin/project-images/${im.id}`, { method: 'DELETE' }); reload(); }} className="absolute -right-1 -top-1 grid h-5 w-5 place-items-center rounded-full bg-red-600 text-white"><Trash2 className="h-3 w-3" /></button></div>)}
        <label className="cursor-pointer rounded border border-dashed border-graphite/30 px-3 py-2 text-xs hover:border-brand">+ Agregar imágenes<input type="file" accept="image/jpeg,image/png,image/webp" multiple className="sr-only" onChange={(e) => upload(p, e.target.files)} /></label></div>
      {!p.published && <p className="mt-2 text-xs text-steel">Las imágenes de proyectos en borrador se ven en el sitio solo cuando el proyecto se publica.</p>}</div>)}</div>}</>);
}

// ---------- Clientes ----------
export function AdminCustomers() {
  const [q, setQ] = useState(''); const [page, setPage] = useState(1);
  const { data, error } = useLoad<{ items: any[]; total: number; pageSize: number }>(`/admin/users?page=${page}${q ? `&q=${encodeURIComponent(q)}` : ''}`);
  return (<><H>Personas registradas</H><input aria-label="Buscar" className="input mb-4 max-w-sm" placeholder="Buscar por nombre o correo" value={q} onChange={(e) => { setPage(1); setQ(e.target.value); }} />
    {error && <ErrorBox>{error}</ErrorBox>}{!data && !error ? <Spinner /> : data && <><div className="card overflow-x-auto"><table className="w-full min-w-[560px] text-sm"><thead><tr className="border-b text-left text-steel"><th className="p-3">Nombre</th><th>Correo</th><th>Teléfono</th><th>Rol</th><th>Solicitudes</th><th>Alta</th></tr></thead><tbody>{data.items.map((u) => <tr key={u.id} className="border-b border-graphite/5"><td className="p-3">{u.name}</td><td>{u.email}</td><td>{u.phone ?? '—'}</td><td>{u.role === 'ADMIN' ? 'Administrador' : 'Cliente'}</td><td>{u._count.quotes}</td><td>{fdate(u.createdAt)}</td></tr>)}</tbody></table></div>
      <div className="mt-4 flex justify-end gap-2"><button className="btn-outline px-3 py-1.5" disabled={page <= 1} onClick={() => setPage(page - 1)}>Anterior</button><button className="btn-outline px-3 py-1.5" disabled={page * data.pageSize >= data.total} onClick={() => setPage(page + 1)}>Siguiente</button></div></>}</>);
}

// ---------- Configuración ----------
export function AdminSettings() {
  const { data, error } = useLoad<any>('/admin/settings');
  const [f, setF] = useState<any>(null); const [msg, setMsg] = useState('');
  useEffect(() => { if (data) setF({ ...data, coverage: data.coverage.join(', ') }); }, [data]);
  if (error) return <ErrorBox>{error}</ErrorBox>; if (!f) return <Spinner />;
  const set = (k: string) => (e: any) => setF({ ...f, [k]: e.target.value });
  const soc = (k: string) => (e: any) => setF({ ...f, social: { ...f.social, [k]: e.target.value } });
  async function save(e: FormEvent) { e.preventDefault(); setMsg(''); const { emailIsProvisional, ...rest } = f; try { await api('/admin/settings', { method: 'PUT', json: { ...rest, coverage: f.coverage.split(',').map((x: string) => x.trim()).filter(Boolean) } }); setMsg('Configuración guardada.'); } catch (er) { setMsg((er as ApiError).message); } }
  const I = (k: string, l: string, hint?: string) => <div><label className="label">{l}</label><input className="input" value={f[k]} onChange={set(k)} />{hint && <p className="mt-1 text-xs text-steel">{hint}</p>}</div>;
  return (<><H>Configuración</H><form onSubmit={save} className="card max-w-3xl space-y-4 p-6">
    <div className="grid gap-4 sm:grid-cols-2">{I('businessName', 'Nombre comercial')}{I('email', 'Correo de contacto', f.emailIsProvisional ? 'Valor provisional: reemplázalo por un correo real.' : undefined)}{I('phone', 'Teléfono')}{I('whatsapp', 'WhatsApp', 'Solo dígitos con código de país, ej. 56912345678.')}</div>
    {I('coverage', 'Zonas de cobertura', 'Separadas por comas.')}{I('hours', 'Horarios')}
    <div className="grid gap-4 sm:grid-cols-3"><div><label className="label">Instagram (URL)</label><input className="input" value={f.social.instagram} onChange={soc('instagram')} /></div><div><label className="label">Facebook (URL)</label><input className="input" value={f.social.facebook} onChange={soc('facebook')} /></div><div><label className="label">LinkedIn (URL)</label><input className="input" value={f.social.linkedin} onChange={soc('linkedin')} /></div></div>
    <div><label className="label">Texto institucional (Nosotros)</label><textarea rows={4} className="input" value={f.about} onChange={set('about')} /></div>
    {msg && <p role="status" className="text-sm">{msg}</p>}<button className="btn-primary">Guardar configuración</button></form></>);
}
