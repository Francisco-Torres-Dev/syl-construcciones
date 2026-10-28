import { motion, useReducedMotion, useScroll, useTransform } from 'motion/react';
import { ArrowRight, ChevronDown, Hammer, HardHat, Home as HomeIcon, Lightbulb, MessageCircle, PaintRoller, Ruler, Store, Wrench } from 'lucide-react';
import { useRef } from 'react';
import { Link } from 'react-router-dom';
import { Art } from '../components/Art';
import { Reveal } from '../components/Reveal';
import { QuoteLink } from '../components/ui';
import { useSeo } from '../lib/seo';
import { useSite } from '../lib/site';
import { servicePhotoFor } from '../lib/portfolio';
import { WHATSAPP_INITIAL_MESSAGE, WHATSAPP_NUMBER } from '../lib/contact';
import { FAQ } from '../components/FAQ';
import { ProjectGrid } from './Projects';

const ICONS = [HomeIcon, HardHat, PaintRoller, Wrench, Store, Ruler, Hammer, Lightbulb];

const STEPS = [
  ['Escuchamos', 'Entendemos qué necesitas, para qué lo necesitas y con qué presupuesto cuentas.'],
  ['Evaluamos', 'Revisamos el espacio, las condiciones y la viabilidad técnica del proyecto.'],
  ['Preparamos una propuesta', 'Alcance, materiales, plazos y condiciones por escrito, a tu medida.'],
  ['Coordinamos la ejecución', 'Organizamos los trabajos y las especialidades que intervienen.'],
  ['Realizamos seguimiento', 'Te mantenemos informado hasta la entrega de la obra.'],
];

export default function Home() {
  useSeo({
    description: 'Construcción, ampliación y remodelación para tu hogar, negocio o proyecto. Solicita una cotización a S&L Construcciones.', path: '/',
    jsonLd: { '@context': 'https://schema.org', '@type': 'GeneralContractor', name: 'S&L Construcciones', slogan: 'Construimos tus ideas. Transformamos tus espacios.', areaServed: 'CL' },
  });
  const { categories } = useSite();
  const services = categories.flatMap((c) => c.services);
  const reduce = useReducedMotion();
  const hero = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: hero, offset: ['start start', 'end start'] });
  const y = useTransform(scrollYProgress, [0, 1], [0, reduce ? 0 : 60]);
  const fade = (d: number) => (reduce ? {} : { initial: { opacity: 0, y: 24 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.7, delay: d, ease: [0.22, 1, 0.36, 1] as const } });

  return (
    <>
      <section ref={hero} className="relative flex min-h-[100svh] items-center overflow-hidden bg-ink pb-20 pt-28 text-white">
        <div className="grid-lines absolute inset-0" aria-hidden="true" />
        <div className="container-x relative grid items-center gap-12 lg:grid-cols-[1.15fr_1fr]">
          <div>
            <motion.p {...fade(0)} className="mb-5 text-xs font-semibold tracking-[0.18em] text-brand">CONSTRUCCIÓN · REMODELACIÓN · SOLUCIONES INTEGRALES</motion.p>
            <motion.h1 {...fade(0.1)} className="text-4xl font-extrabold leading-[1.05] sm:text-6xl">Construimos tus ideas.<br />Transformamos tus espacios.</motion.h1>
            <motion.p {...fade(0.25)} className="mt-6 max-w-xl text-lg text-white/70">Soluciones de construcción, ampliación y remodelación para tu hogar, negocio o proyecto. Cuéntanos qué necesitas y preparemos una propuesta a tu medida.</motion.p>
            <motion.div {...fade(0.4)} className="mt-9 flex flex-wrap gap-3">
              <QuoteLink />
              <Link to="/servicios" className="btn-ghost">Explorar servicios</Link>
              <a href={`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(WHATSAPP_INITIAL_MESSAGE)}`} target="_blank" rel="noopener noreferrer" className="btn bg-[#25D366] text-[#062b14] hover:-translate-y-0.5 hover:bg-[#20bd5a]">
                <MessageCircle className="h-4 w-4" aria-hidden="true" />Solicitar por WhatsApp
              </a>
            </motion.div>
          </div>
          <motion.div style={{ y }} {...(reduce ? {} : { initial: { opacity: 0, scale: 0.96 }, animate: { opacity: 1, scale: 1 }, transition: { duration: 1, delay: 0.3 } })}
            className="relative hidden aspect-[4/3] overflow-hidden rounded-lg border border-white/10 lg:block">
            <Art variant={0} className="h-full w-full" />
            <div className="absolute left-0 top-0 h-1 w-1/3 bg-brand" />
          </motion.div>
        </div>
        <a href="#servicios" aria-label="Desplazarse hacia los servicios" className="absolute bottom-6 left-1/2 -translate-x-1/2 text-white/60 hover:text-brand"><ChevronDown className={`h-7 w-7 ${reduce ? '' : 'animate-bounce'}`} /></a>
      </section>

      <section id="servicios" className="section bg-mist">
        <div className="container-x">
          <Reveal><h2 className="max-w-2xl text-3xl font-extrabold sm:text-4xl">Del arreglo puntual a la obra de mayor alcance</h2>
            <p className="mt-3 max-w-2xl text-steel">Estas son nuestras áreas de trabajo. El valor final siempre depende de la evaluación de cada proyecto.</p></Reveal>
          <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {services.map((s, i) => {
              const Icon = ICONS[i % ICONS.length];
              const photo = servicePhotoFor(s.slug, i);
              return (
                <Reveal key={s.id} delay={(i % 4) * 0.06}>
                  <Link to={`/servicios/${s.slug}`} className="group card flex h-full flex-col overflow-hidden transition duration-300 hover:-translate-y-1 hover:border-brand focus-visible:-translate-y-1">
                    <div className="aspect-[16/10] overflow-hidden"><img src={photo.src} alt={photo.alt} loading="lazy" className="h-full w-full object-cover transition duration-500 group-hover:scale-105" /></div>
                    <div className="flex flex-1 flex-col p-5">
                      <Icon className="h-6 w-6 text-brand transition group-hover:-rotate-6" />
                      <h3 className="mt-3 text-lg font-bold">{s.name}</h3>
                      <p className="mt-1 flex-1 text-sm text-steel">{s.summary}</p>
                      <span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-brand-dark opacity-100 transition md:-translate-x-2 md:opacity-0 md:group-hover:translate-x-0 md:group-hover:opacity-100">Ver servicio <ArrowRight className="h-4 w-4" /></span>
                    </div>
                  </Link>
                </Reveal>
              );
            })}
          </div>
        </div>
      </section>

      <section className="section bg-graphite text-white">
        <div className="container-x">
          <Reveal><h2 className="max-w-2xl text-3xl font-extrabold sm:text-4xl">Un proceso claro, de la primera consulta a la entrega</h2></Reveal>
          <ol className="relative mt-14 grid gap-8 md:grid-cols-5">
            <div className="absolute left-0 right-0 top-5 hidden h-px bg-white/15 md:block" aria-hidden="true" />
            {STEPS.map(([t, d], i) => (
              <Reveal key={t} delay={i * 0.08}>
                <li className="relative">
                  <span className="relative z-10 grid h-10 w-10 place-items-center rounded-full bg-brand font-display font-bold text-ink">{i + 1}</span>
                  <h3 className="mt-5 text-lg font-bold">{t}</h3>
                  <p className="mt-2 text-sm text-white/65">{d}</p>
                </li>
              </Reveal>
            ))}
          </ol>
        </div>
      </section>

      <section className="section">
        <div className="container-x">
          <Reveal><h2 className="text-3xl font-extrabold sm:text-4xl">Proyectos</h2>
            <p className="mt-3 max-w-2xl text-steel">Conoce algunos de nuestros trabajos de remodelación, instalación y habilitación de espacios.</p></Reveal>
          <div className="mt-10"><ProjectGrid limit={4} /></div>
          <div className="mt-8"><Link to="/proyectos" className="btn-outline">Ver todos los proyectos</Link></div>
        </div>
      </section>

      <section className="bg-brand py-20 text-ink">
        <div className="container-x text-center">
          <Reveal>
            <h2 className="text-3xl font-extrabold sm:text-4xl">¿Tienes un proyecto en mente?</h2>
            <p className="mx-auto mt-3 max-w-xl text-ink/80">Desde una reparación puntual hasta una obra de mayor alcance, cuéntanos qué necesitas.</p>
            <QuoteLink className="btn-dark mt-8" />
          </Reveal>
        </div>
      </section>

      <section className="section bg-mist"><div className="container-x max-w-3xl"><h2 className="mb-8 text-3xl font-extrabold">Preguntas frecuentes</h2><FAQ /></div></section>
    </>
  );
}
