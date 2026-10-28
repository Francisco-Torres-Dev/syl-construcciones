import { Loader2 } from 'lucide-react';
import { useEffect, useRef, useState, type FormEvent, type ReactNode } from 'react';
import { Link, useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { ErrorBox } from '../components/ui';
import { Logo } from '../components/Logo';
import { api, ApiError } from '../lib/api';
import { useAuth } from '../lib/auth';
import { useSeo } from '../lib/seo';

function Shell({ title, children }: { title: string; children: ReactNode }) {
  useSeo({ title, noindex: true });
  return (
    <div className="grid min-h-screen place-items-center bg-mist px-4 pb-16 pt-28">
      <div className="card w-full max-w-md p-8 shadow-sm">
        <Link to="/" aria-label="Inicio"><img src="/brand/sl-logo-light.svg" alt="S&L Construcciones" className="mb-6 h-9" /></Link>
        <h1 className="mb-6 text-2xl font-extrabold">{title}</h1>
        {children}
      </div>
    </div>
  );
}

function useAsync() {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [fields, setFields] = useState<Record<string, string[]>>({});
  async function run(fn: () => Promise<void>) {
    setBusy(true); setError(''); setFields({});
    try { await fn(); } catch (e) { const a = e as ApiError; setError(a.message); setFields(a.fields ?? {}); } finally { setBusy(false); }
  }
  return { busy, error, fields, run };
}

const Submit = ({ busy, children }: { busy: boolean; children: ReactNode }) => <button className="btn-primary w-full" disabled={busy}>{busy && <Loader2 className="h-4 w-4 animate-spin" />}{children}</button>;

declare global { interface Window { google?: { accounts: { id: { initialize: (c: object) => void; renderButton: (el: HTMLElement, o: object) => void } } } } }

function GoogleButton({ onDone }: { onDone: () => void }) {
  const { google } = useAuth();
  const [cfg, setCfg] = useState<{ googleClientId: string | null } | null>(null);
  const [err, setErr] = useState('');
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => { api<{ googleClientId: string | null }>('/auth/config').then(setCfg).catch(() => setCfg({ googleClientId: null })); }, []);
  useEffect(() => {
    if (!cfg?.googleClientId) return;
    const init = () => {
      window.google?.accounts.id.initialize({ client_id: cfg.googleClientId, callback: (r: { credential: string }) => google(r.credential).then(onDone).catch((e: ApiError) => setErr(e.message)) });
      if (ref.current) window.google?.accounts.id.renderButton(ref.current, { theme: 'outline', size: 'large', width: 340, text: 'continue_with', locale: 'es' });
    };
    if (window.google) return init();
    const s = document.createElement('script'); s.src = 'https://accounts.google.com/gsi/client'; s.async = true; s.onload = init; document.head.appendChild(s);
  }, [cfg, google, onDone]);

  if (!cfg) return null;
  if (!cfg.googleClientId) return <p className="rounded-md bg-mist p-3 text-center text-xs text-steel">El acceso con Google aún no está configurado en este sitio.</p>;
  return <div><div ref={ref} className="flex justify-center" />{err && <p className="err text-center">{err}</p>}</div>;
}

const Or = () => <div className="my-5 flex items-center gap-3 text-xs text-steel"><span className="h-px flex-1 bg-graphite/10" />o<span className="h-px flex-1 bg-graphite/10" /></div>;

export function Login() {
  const { login, user } = useAuth();
  const nav = useNavigate();
  const loc = useLocation() as { state?: { from?: string } };
  const [email, setEmail] = useState(''); const [password, setPassword] = useState('');
  const { busy, error, run } = useAsync();
  const go = () => nav(loc.state?.from ?? '/cuenta', { replace: true });
  useEffect(() => { if (user) nav(user.role === 'ADMIN' ? '/admin' : (loc.state?.from ?? '/cuenta'), { replace: true }); }, [user]); // eslint-disable-line
  const submit = (e: FormEvent) => { e.preventDefault(); run(async () => { await login(email, password); go(); }); };
  return (
    <Shell title="Ingresar">
      <form onSubmit={submit} className="space-y-4">
        <div><label className="label" htmlFor="e">Correo electrónico</label><input id="e" type="email" required autoComplete="email" className="input" value={email} onChange={(e) => setEmail(e.target.value)} /></div>
        <div><label className="label" htmlFor="p">Contraseña</label><input id="p" type="password" required autoComplete="current-password" className="input" value={password} onChange={(e) => setPassword(e.target.value)} /></div>
        {error && <ErrorBox>{error}</ErrorBox>}
        <Submit busy={busy}>Ingresar</Submit>
      </form>
      <p className="mt-3 text-right text-sm"><Link to="/recuperar" className="text-brand-dark hover:underline">¿Olvidaste tu contraseña?</Link></p>
      <Or /><GoogleButton onDone={go} />
      <p className="mt-6 text-center text-sm text-steel">¿No tienes cuenta? <Link to="/registro" className="font-semibold text-brand-dark hover:underline">Regístrate</Link></p>
    </Shell>
  );
}

export function Register() {
  const { register } = useAuth();
  const nav = useNavigate();
  const [f, setF] = useState({ name: '', email: '', phone: '', password: '' });
  const [msg, setMsg] = useState('');
  const { busy, error, fields, run } = useAsync();
  const set = (k: keyof typeof f) => (e: React.ChangeEvent<HTMLInputElement>) => setF({ ...f, [k]: e.target.value });
  const submit = (e: FormEvent) => { e.preventDefault(); run(async () => { const r = await register(f); if (r.needsVerification) setMsg(r.message ?? ''); else nav('/cuenta', { replace: true }); }); };
  if (msg) return <Shell title="Revisa tu correo"><p className="text-steel">{msg}</p><Link to="/ingresar" className="btn-primary mt-6 w-full">Ir a ingresar</Link></Shell>;
  return (
    <Shell title="Crear cuenta">
      <form onSubmit={submit} className="space-y-4">
        <div><label className="label" htmlFor="n">Nombre</label><input id="n" required className="input" autoComplete="name" value={f.name} onChange={set('name')} />{fields.name && <p className="err">{fields.name[0]}</p>}</div>
        <div><label className="label" htmlFor="e">Correo electrónico</label><input id="e" type="email" required className="input" autoComplete="email" value={f.email} onChange={set('email')} />{fields.email && <p className="err">{fields.email[0]}</p>}</div>
        <div><label className="label" htmlFor="t">Teléfono (opcional)</label><input id="t" type="tel" className="input" autoComplete="tel" value={f.phone} onChange={set('phone')} /></div>
        <div><label className="label" htmlFor="p">Contraseña</label><input id="p" type="password" required className="input" autoComplete="new-password" value={f.password} onChange={set('password')} /><p className="mt-1 text-xs text-steel">Mínimo 10 caracteres, con letras y números.</p>{fields.password && <p className="err">{fields.password[0]}</p>}</div>
        {error && <ErrorBox>{error}</ErrorBox>}
        <Submit busy={busy}>Crear cuenta</Submit>
      </form>
      <Or /><GoogleButton onDone={() => nav('/cuenta', { replace: true })} />
      <p className="mt-6 text-center text-sm text-steel">¿Ya tienes cuenta? <Link to="/ingresar" className="font-semibold text-brand-dark hover:underline">Ingresa</Link></p>
    </Shell>
  );
}

export function Forgot() {
  const [email, setEmail] = useState(''); const [done, setDone] = useState<{ message: string; emailConfigured: boolean } | null>(null);
  const { busy, error, run } = useAsync();
  return (
    <Shell title="Recuperar contraseña">
      {done ? <div className="space-y-3"><p className="text-steel">{done.message}</p>{!done.emailConfigured && <ErrorBox>El envío de correos aún no está configurado en el servidor, por lo que no recibirás el mensaje.</ErrorBox>}<Link to="/ingresar" className="btn-outline w-full">Volver</Link></div> : (
        <form onSubmit={(e) => { e.preventDefault(); run(async () => setDone(await api('/auth/forgot', { json: { email } }))); }} className="space-y-4">
          <div><label className="label" htmlFor="e">Correo electrónico</label><input id="e" type="email" required className="input" value={email} onChange={(e) => setEmail(e.target.value)} /></div>
          {error && <ErrorBox>{error}</ErrorBox>}<Submit busy={busy}>Enviar instrucciones</Submit>
        </form>)}
    </Shell>
  );
}

export function Reset() {
  const [p] = useSearchParams(); const token = p.get('token') ?? '';
  const [password, setPassword] = useState(''); const [ok, setOk] = useState('');
  const { busy, error, fields, run } = useAsync();
  return (
    <Shell title="Nueva contraseña">
      {ok ? <div><p className="text-steel">{ok}</p><Link to="/ingresar" className="btn-primary mt-5 w-full">Ingresar</Link></div> : (
        <form onSubmit={(e) => { e.preventDefault(); run(async () => setOk((await api<{ message: string }>('/auth/reset', { json: { token, password } })).message)); }} className="space-y-4">
          <div><label className="label" htmlFor="p">Nueva contraseña</label><input id="p" type="password" required className="input" autoComplete="new-password" value={password} onChange={(e) => setPassword(e.target.value)} />{fields.password && <p className="err">{fields.password[0]}</p>}</div>
          {error && <ErrorBox>{error}</ErrorBox>}<Submit busy={busy}>Guardar contraseña</Submit>
        </form>)}
    </Shell>
  );
}

export function Verify() {
  const [p] = useSearchParams();
  const [state, setState] = useState<{ ok: boolean; msg: string } | null>(null);
  useEffect(() => { api<{ message: string }>('/auth/verify', { json: { token: p.get('token') ?? '' } }).then((r) => setState({ ok: true, msg: r.message })).catch((e: ApiError) => setState({ ok: false, msg: e.message })); }, [p]);
  return <Shell title="Confirmación de correo">{!state ? <p className="text-steel">Verificando…</p> : state.ok ? <p className="text-emerald-700">{state.msg}</p> : <ErrorBox>{state.msg}</ErrorBox>}<Link to="/ingresar" className="btn-outline mt-6 w-full">Ir a ingresar</Link></Shell>;
}
