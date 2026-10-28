import { ArrowRight, Check } from 'lucide-react';
import { Link, useParams } from 'react-router-dom';
import { FAQ } from '../components/FAQ';
import { Reveal } from '../components/Reveal';
import { ErrorBox, PageHead, QuoteLink } from '../components/ui';
import { servicePhotoFor } from '../lib/portfolio';
import { SERVICE_CATEGORIES } from '../lib/services';
import { useSeo, SITE_URL } from '../lib/seo';

export function ServicesIndex() {
  useSeo({ title: 'Servicios de construcción y remodelación', description: 'Construcción, techumbres, remodelaciones, obras civiles, instalaciones, locales comerciales, asesorías y reparaciones.', path: '/servicios' });
  let n = 0;
  return (
    <>
      <PageHead title="Servicios" intro="Todo lo que necesitas para construir, ampliar, remodelar y mantener tu hogar o negocio." />
      <div className="section container-x space-y-16">
        {SERVICE_CATEGORIES.map((c) => (
          <section key={c.id}>
            <Reveal><h2 className="text-2xl font-extrabold">{c.name}</h2><p className="mt-1 text-steel">{c.description}</p></Reveal>
            <div className="mt-6 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
              {c.services.map((s) => {
                const i = n++;
                const photo = servicePhotoFor(s.slug, i);
                return (
                  <Reveal key={s.id}>
                    <Link to={`/servicios/${s.slug}`} className="group card flex h-full flex-col overflow-hidden transition hover:-translate-y-1 hover:border-brand">
                      <div className="aspect-[16/9] overflow-hidden"><img src={photo.src} alt={photo.alt} loading="lazy" className="h-full w-full object-cover transition duration-500 group-hover:scale-105" /></div>
                      <div className="p-5"><h3 className="text-lg font-bold">{s.name}</h3><p className="mt-1 text-sm text-steel">{s.summary}</p>
                        <span className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-brand-dark">Ver detalle <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" /></span></div>
                    </Link>
                  </Reveal>
                );
              })}
            </div>
          </section>
        ))}
      </div>
    </>
  );
}

export function ServiceDetail() {
  const { slug } = useParams();
  const serviceCategory = SERVICE_CATEGORIES.find((category) => category.services.some((service) => service.slug === slug));
  const s = serviceCategory?.services.find((service) => service.slug === slug);
  const related = serviceCategory?.services.filter((service) => service.slug !== slug).slice(0, 3) ?? [];
  useSeo({
    title: s?.name, description: s ? `${s.summary} Solicita tu cotización a S&L Construcciones.` : undefined, path: `/servicios/${slug}`,
    jsonLd: s ? { '@context': 'https://schema.org', '@type': 'Service', name: s.name, description: s.summary, provider: { '@type': 'GeneralContractor', name: 'S&L Construcciones', url: SITE_URL }, areaServed: 'CL' } : undefined,
  });

  if (!s || !serviceCategory) return <div className="container-x pt-40 pb-20"><ErrorBox>Este servicio no existe o no está disponible.</ErrorBox><Link to="/servicios" className="btn-outline mt-6">Volver a servicios</Link></div>;

  return (
    <>
      <PageHead title={s.name} intro={s.summary} />
      <div className="section container-x grid gap-12 lg:grid-cols-[1.6fr_1fr]">
        <div className="space-y-10">
          <p className="text-lg">{s.description}</p>
          <div><h2 className="text-xl font-bold">Alcance general</h2><p className="mt-2 text-steel">{s.scope}</p></div>
          <div><h2 className="text-xl font-bold">Trabajos incluidos</h2>
            <ul className="mt-4 grid gap-2 sm:grid-cols-2">{s.includes.map((x) => <li key={x} className="flex items-start gap-2 text-sm"><Check className="mt-0.5 h-4 w-4 shrink-0 text-brand" />{x}</li>)}</ul></div>
          {s.info && <div className="rounded-lg border-l-4 border-brand bg-mist p-5 text-sm"><h2 className="mb-1 font-display font-bold">Información relevante</h2>{s.info}</div>}
          {s.faqs.length > 0 && <div><h2 className="mb-4 text-xl font-bold">Preguntas frecuentes</h2><FAQ items={s.faqs} /></div>}
        </div>
        <aside className="space-y-6 lg:sticky lg:top-28 lg:self-start">
          <div className="overflow-hidden rounded-lg"><img src={servicePhotoFor(s.slug).src} alt={servicePhotoFor(s.slug).alt} className="aspect-[4/3] w-full object-cover" /></div>
          <div className="card p-6"><h2 className="font-display text-lg font-bold">¿Quieres cotizar este servicio?</h2><p className="mt-2 text-sm text-steel">Cuéntanos tu proyecto y te preparamos una propuesta.</p><QuoteLink slug={s.slug} className="btn-primary mt-4 w-full" /></div>
          {related.length > 0 && <div><h2 className="mb-3 font-display font-bold">Servicios relacionados</h2><ul className="space-y-2">{related.map((r) => <li key={r.id}><Link to={`/servicios/${r.slug}`} className="text-sm text-brand-dark hover:underline">{r.name}</Link></li>)}</ul></div>}
        </aside>
      </div>
    </>
  );
}
