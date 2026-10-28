import { zodResolver } from '@hookform/resolvers/zod';
import { CheckCircle2, FileText, Loader2, Upload, X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useSearchParams } from 'react-router-dom';
import { z } from 'zod';
import { ErrorBox, PageHead } from '../components/ui';
import { api, ApiError } from '../lib/api';
import { useAuth } from '../lib/auth';
import { PROPIEDADES, REGIONES } from '../lib/chile';
import { useSeo } from '../lib/seo';
import { useSite } from '../lib/site';

const MAX_FILES = 8;
const MAX_BYTES = 8 * 1024 * 1024;
const TYPES = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];

const schema = z.object({
  fullName: z.string().trim().min(3, 'Ingresa tu nombre completo.'),
  email: z.string().trim().email('Ingresa un correo válido.'),
  phone: z.string().trim().regex(/^\+?[0-9 ()-]{8,20}$/, 'Ingresa un teléfono válido, por ejemplo +56 9 1234 5678.'),
  region: z.string().min(1, 'Selecciona tu región.'),
  comuna: z.string().trim().min(2, 'Ingresa tu comuna.'),
  serviceName: z.string().min(1, 'Selecciona un tipo de servicio.'),
  propertyType: z.string().min(1, 'Selecciona el tipo de propiedad.'),
  description: z.string().trim().min(20, 'Describe tu proyecto con al menos 20 caracteres.'),
  dimensions: z.string().optional(),
  budget: z.string().optional(),
  tentativeDate: z.string().optional(),
  contactPref: z.enum(['email', 'telefono', 'whatsapp']),
  privacy: z.literal(true, { errorMap: () => ({ message: 'Debes aceptar la política de privacidad.' }) }),
});
type Form = z.infer<typeof schema>;

const Err = ({ m }: { m?: string }) => (m ? <p className="err" role="alert">{m}</p> : null);

export default function Quote() {
  useSeo({ title: 'Solicitar cotización', description: 'Solicita una cotización para tu proyecto de construcción, ampliación o remodelación.', path: '/cotizar' });
  const { user } = useAuth();
  const { categories } = useSite();
  const [params] = useSearchParams();
  const services = categories.flatMap((c) => c.services);
  const [files, setFiles] = useState<{ file: File; url: string | null }[]>([]);
  const [fileErr, setFileErr] = useState('');
  const [serverErr, setServerErr] = useState('');
  const [done, setDone] = useState<{ code: string } | null>(null);
  const input = useRef<HTMLInputElement>(null);
  const urls = useRef<string[]>([]);

  const { register, handleSubmit, setValue, setError, formState: { errors, isSubmitting } } = useForm<Form>({ resolver: zodResolver(schema), defaultValues: { contactPref: 'email', region: '', serviceName: '', propertyType: '' } });

  useEffect(() => { if (user) { setValue('fullName', user.name); setValue('email', user.email); if (user.phone) setValue('phone', user.phone); } }, [user, setValue]);
  useEffect(() => { const s = services.find((x) => x.slug === params.get('servicio')); if (s) setValue('serviceName', s.name); }, [services.length, params, setValue]); // eslint-disable-line
  useEffect(() => () => urls.current.forEach(URL.revokeObjectURL), []);

  function addFiles(list: FileList | null) {
    if (!list) return;
    setFileErr('');
    const next = [...files];
    for (const f of Array.from(list)) {
      if (!TYPES.includes(f.type)) { setFileErr(`"${f.name}": formato no permitido. Usa JPG, PNG, WEBP o PDF.`); continue; }
      if (f.size > MAX_BYTES) { setFileErr(`"${f.name}" supera los 8 MB.`); continue; }
      if (next.length >= MAX_FILES) { setFileErr(`Puedes adjuntar hasta ${MAX_FILES} archivos.`); break; }
      const url = f.type.startsWith('image/') ? URL.createObjectURL(f) : null;
      if (url) urls.current.push(url);
      next.push({ file: f, url });
    }
    setFiles(next);
    if (input.current) input.current.value = '';
  }

  async function onSubmit(v: Form) {
    setServerErr('');
    const fd = new FormData();
    const slug = services.find((s) => s.name === v.serviceName)?.slug ?? '';
    Object.entries({ ...v, serviceSlug: slug, privacyAccepted: 'true' }).forEach(([k, val]) => { if (k !== 'privacy' && val !== undefined) fd.append(k, String(val)); });
    files.forEach(({ file }) => fd.append('files', file));
    try {
      const r = await api<{ code: string }>('/quotes', { form: fd });
      setDone({ code: r.code });
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (e) {
      const err = e as ApiError;
      if (err.fields) Object.entries(err.fields).forEach(([k, m]) => setError(k === 'privacyAccepted' ? 'privacy' : (k as keyof Form), { message: m[0] }));
      setServerErr(err.message);
    }
  }

  if (done) {
    return (
      <div className="container-x max-w-2xl pb-24 pt-40 text-center">
        <CheckCircle2 className="mx-auto h-14 w-14 text-emerald-600" />
        <h1 className="mt-4 text-3xl font-extrabold">Recibimos tu solicitud</h1>
        <p className="mt-3 text-steel">Tu código de seguimiento es</p>
        <p className="mt-1 font-display text-3xl font-extrabold text-brand-dark">{done.code}</p>
        <p className="mt-4 text-steel">Revisaremos la información y te contactaremos por el medio que elegiste. Guarda este código para cualquier consulta.</p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          {user ? <Link to="/cuenta" className="btn-primary">Ver mis solicitudes</Link> : <Link to="/registro" className="btn-primary">Crear cuenta para seguir mi solicitud</Link>}
          <Link to="/" className="btn-outline">Volver al inicio</Link>
        </div>
      </div>
    );
  }

  return (
    <>
      <PageHead title="Solicitar cotización" intro="Cuéntanos qué necesitas. El precio final depende de la evaluación de tu proyecto. No necesitas una cuenta para enviar tu solicitud." />
      <form onSubmit={handleSubmit(onSubmit)} noValidate className="container-x max-w-3xl space-y-6 py-14" aria-busy={isSubmitting}>
        <p className="text-sm text-steel">Los campos con <span className="text-red-600">*</span> son obligatorios.</p>
        <div className="grid gap-5 sm:grid-cols-2">
          <div><label className="label" htmlFor="fullName">Nombre completo <span className="text-red-600">*</span></label><input id="fullName" className="input" autoComplete="name" {...register('fullName')} /><Err m={errors.fullName?.message} /></div>
          <div><label className="label" htmlFor="email">Correo electrónico <span className="text-red-600">*</span></label><input id="email" type="email" className="input" autoComplete="email" {...register('email')} /><Err m={errors.email?.message} /></div>
          <div><label className="label" htmlFor="phone">Teléfono <span className="text-red-600">*</span></label><input id="phone" type="tel" className="input" autoComplete="tel" placeholder="+56 9 1234 5678" {...register('phone')} /><Err m={errors.phone?.message} /></div>
          <div><label className="label" htmlFor="contactPref">Medio de contacto preferido <span className="text-red-600">*</span></label>
            <select id="contactPref" className="input" {...register('contactPref')}><option value="email">Correo electrónico</option><option value="telefono">Llamada telefónica</option><option value="whatsapp">WhatsApp</option></select></div>
          <div><label className="label" htmlFor="region">Región <span className="text-red-600">*</span></label>
            <select id="region" className="input" {...register('region')}><option value="">Selecciona…</option>{REGIONES.map((r) => <option key={r}>{r}</option>)}</select><Err m={errors.region?.message} /></div>
          <div><label className="label" htmlFor="comuna">Comuna <span className="text-red-600">*</span></label><input id="comuna" className="input" {...register('comuna')} /><Err m={errors.comuna?.message} /></div>
          <div><label className="label" htmlFor="serviceName">Tipo de servicio <span className="text-red-600">*</span></label>
            <select id="serviceName" className="input" {...register('serviceName')}><option value="">Selecciona…</option>{services.map((s) => <option key={s.id}>{s.name}</option>)}<option>Otro / no estoy seguro</option></select><Err m={errors.serviceName?.message} /></div>
          <div><label className="label" htmlFor="propertyType">Tipo de propiedad <span className="text-red-600">*</span></label>
            <select id="propertyType" className="input" {...register('propertyType')}><option value="">Selecciona…</option>{PROPIEDADES.map((p) => <option key={p}>{p}</option>)}</select><Err m={errors.propertyType?.message} /></div>
        </div>
        <div><label className="label" htmlFor="description">Descripción del proyecto <span className="text-red-600">*</span></label><textarea id="description" rows={5} className="input" placeholder="¿Qué quieres hacer? ¿Hay algo importante que debamos saber del lugar?" {...register('description')} /><Err m={errors.description?.message} /></div>
        <div className="grid gap-5 sm:grid-cols-3">
          <div><label className="label" htmlFor="dimensions">Dimensiones aproximadas</label><input id="dimensions" className="input" placeholder="Ej.: 6 m × 4 m" {...register('dimensions')} /></div>
          <div><label className="label" htmlFor="budget">Presupuesto estimado (opcional)</label><input id="budget" className="input" placeholder="Ej.: $3.000.000" {...register('budget')} /></div>
          <div><label className="label" htmlFor="tentativeDate">Fecha tentativa</label><input id="tentativeDate" type="date" className="input" {...register('tentativeDate')} /></div>
        </div>

        <div>
          <span className="label">Fotografías o documentos (opcional)</span>
          <button type="button" onClick={() => input.current?.click()} className="flex w-full flex-col items-center gap-1 rounded-lg border-2 border-dashed border-graphite/20 p-6 text-sm text-steel transition hover:border-brand">
            <Upload className="h-6 w-6" />Haz clic para adjuntar archivos<span className="text-xs">JPG, PNG, WEBP o PDF · hasta 8 MB cada uno · máximo {MAX_FILES}</span>
          </button>
          <input ref={input} type="file" multiple accept={TYPES.join(',')} className="sr-only" aria-label="Adjuntar archivos" onChange={(e) => addFiles(e.target.files)} />
          {fileErr && <p className="err" role="alert">{fileErr}</p>}
          {files.length > 0 && <ul className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {files.map(({ file, url }, i) => (
              <li key={file.name + i} className="relative overflow-hidden rounded-md border border-graphite/10">
                {url ? <img src={url} alt={`Vista previa de ${file.name}`} className="aspect-square w-full object-cover" /> : <div className="grid aspect-square place-items-center bg-mist"><FileText className="h-8 w-8 text-steel" /></div>}
                <p className="truncate px-2 py-1 text-xs">{file.name}</p>
                <button type="button" aria-label={`Quitar ${file.name}`} onClick={() => setFiles(files.filter((_, j) => j !== i))} className="absolute right-1 top-1 grid h-6 w-6 place-items-center rounded-full bg-black/70 text-white"><X className="h-3 w-3" /></button>
              </li>))}
          </ul>}
        </div>

        <div><label className="flex items-start gap-2 text-sm"><input type="checkbox" className="mt-1" {...register('privacy')} /><span>He leído y acepto la <Link to="/privacidad" target="_blank" className="text-brand-dark underline">política de privacidad</Link>. <span className="text-red-600">*</span></span></label><Err m={errors.privacy?.message} /></div>
        {serverErr && <ErrorBox>{serverErr}</ErrorBox>}
        <button type="submit" disabled={isSubmitting} className="btn-primary w-full sm:w-auto">{isSubmitting ? <><Loader2 className="h-4 w-4 animate-spin" />Enviando…</> : 'Enviar solicitud'}</button>
      </form>
    </>
  );
}
