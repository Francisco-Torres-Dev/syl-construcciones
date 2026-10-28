import { Mail, MessageCircle, Phone } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Reveal } from '../components/Reveal';
import { whatsappLink } from '../components/Footer';
import { PageHead, QuoteLink } from '../components/ui';
import { useSeo } from '../lib/seo';
import { useSite } from '../lib/site';

export function About() {
  useSeo({ title: 'Nosotros', description: 'Conoce los principios de trabajo de S&L Construcciones.', path: '/nosotros' });
  const { settings } = useSite();
  const values = [['Confianza y transparencia', 'Propuestas por escrito, con alcance, plazos, condiciones y exclusiones claras.'], ['Calidad constructiva', 'Terminaciones prolijas y soluciones técnicas pensadas para durar.'], ['Atención personalizada', 'Cada proyecto es distinto: te escuchamos antes de proponer.'], ['Proyectos pequeños y grandes', 'Desde instalar un cobertizo hasta remodelar una vivienda o habilitar un local.'], ['Responsabilidad', 'Cumplimos la normativa aplicable y trabajamos con especialistas autorizados cuando corresponde.'], ['Precisión técnica', 'Evaluamos, cubicamos y planificamos antes de ejecutar.']];
  return (
    <>
      <PageHead title="Nosotros" intro="S&L Construcciones es una empresa chilena de construcción, remodelación y habilitación de espacios." />
      <div className="section container-x">
        {settings.about && <p className="mb-14 max-w-3xl text-lg">{settings.about}</p>}
        <div className="grid gap-px overflow-hidden rounded-lg border border-graphite/10 bg-graphite/10 sm:grid-cols-2 lg:grid-cols-3">
          {values.map(([t, d], i) => <Reveal key={t} delay={i * 0.05} className="bg-white p-7"><h2 className="font-display text-lg font-bold">{t}</h2><p className="mt-2 text-sm text-steel">{d}</p></Reveal>)}
        </div>
        <div className="mt-12"><QuoteLink /></div>
      </div>
    </>
  );
}

const TIPS = [
  ['Prepara tu solicitud para cotizar mejor', 'Incluye medidas aproximadas, fotografías del lugar, el uso que le darás al espacio y un presupuesto de referencia. Mientras más información, más precisa será la propuesta.'],
  ['Qué esperar de una visita técnica', 'Es una revisión en terreno para evaluar el estado del lugar, tomar medidas y detectar condiciones que afecten el trabajo antes de fijar alcance y plazos.'],
  ['Gas y electricidad: instaladores autorizados', 'Las instalaciones de gas y eléctricas deben cumplir la normativa chilena y ser realizadas por instaladores autorizados cuando corresponde. Pregunta siempre por esto antes de contratar.'],
  ['Planifica por etapas', 'Si el presupuesto es acotado, dividir la obra en etapas permite avanzar ordenadamente. Una buena planificación evita rehacer trabajos.'],
];
export function Tips() {
  useSeo({ title: 'Consejos', description: 'Consejos prácticos para planificar y cotizar tu proyecto de construcción o remodelación.', path: '/consejos' });
  return (<><PageHead title="Consejos" intro="Ideas prácticas para planificar tu proyecto." />
    <div className="section container-x grid max-w-4xl gap-8">{TIPS.map(([t, d]) => <Reveal key={t}><article className="border-l-4 border-brand pl-6"><h2 className="text-xl font-bold">{t}</h2><p className="mt-2 text-steel">{d}</p></article></Reveal>)}</div></>);
}

export function Contact() {
  useSeo({ title: 'Contacto', description: 'Contacta a S&L Construcciones o solicita una cotización.', path: '/contacto' });
  const { settings: s } = useSite();
  return (<><PageHead title="Contacto" intro="Escríbenos o envía tu solicitud de cotización." />
    <div className="section container-x grid gap-10 md:grid-cols-2">
      <div className="space-y-5">
        <p className="flex items-center gap-3"><Mail className="text-brand" /><a href={`mailto:${s.email}`} className="hover:underline">{s.email}</a></p>
        {s.emailIsProvisional && <p className="text-xs text-steel">Dirección provisional, pendiente de confirmación.</p>}
        {s.phone && <p className="flex items-center gap-3"><Phone className="text-brand" />{s.phone}</p>}
        {s.whatsapp && <p className="flex items-center gap-3"><MessageCircle className="text-brand" /><a href={whatsappLink(s.whatsapp)} target="_blank" rel="noopener noreferrer" className="hover:underline">Escribir por WhatsApp</a></p>}
        {s.hours && <p><strong>Horario:</strong> {s.hours}</p>}
        {s.coverage.length > 0 && <p><strong>Cobertura:</strong> {s.coverage.join(', ')}</p>}
      </div>
      <div className="card p-7"><h2 className="font-display text-xl font-bold">¿Tienes un proyecto?</h2><p className="mt-2 text-steel">El formulario de cotización nos entrega los datos necesarios para evaluarlo.</p><QuoteLink className="btn-primary mt-5" /></div>
    </div></>);
}

const Doc = ({ title, children }: { title: string; children: React.ReactNode }) => (<><PageHead title={title} /><div className="section container-x max-w-3xl space-y-5 text-steel [&_h2]:mt-6 [&_h2]:font-display [&_h2]:text-xl [&_h2]:font-bold [&_h2]:text-graphite">{children}</div></>);

export function Privacy() {
  useSeo({ title: 'Política de privacidad', path: '/privacidad' });
  const { settings: s } = useSite();
  return (<Doc title="Política de privacidad">
    <p className="rounded-md bg-amber-50 p-3 text-sm text-amber-900">Texto base de referencia. Debe ser revisado por un abogado y ajustado a los datos reales de la empresa antes de publicarse (incluida la Ley N° 19.628 sobre protección de la vida privada y sus modificaciones vigentes).</p>
    <h2>Qué datos recopilamos</h2><p>Nombre, correo, teléfono, comuna y región, descripción del proyecto, fotografías o documentos que adjuntes, y los datos de tu cuenta si te registras.</p>
    <h2>Para qué los usamos</h2><p>Para evaluar tu solicitud, contactarte, preparar cotizaciones y mantener el historial de tu cuenta. No vendemos tus datos.</p>
    <h2>Quién accede</h2><p>Solo el equipo autorizado de S&amp;L Construcciones y los proveedores técnicos necesarios para operar el sitio (alojamiento, almacenamiento y correo).</p>
    <h2>Tus derechos</h2><p>Puedes solicitar acceso, rectificación o eliminación de tus datos escribiendo a <a className="text-brand-dark underline" href={`mailto:${s.email}`}>{s.email}</a>.</p></Doc>);
}
export function Terms() {
  useSeo({ title: 'Términos y condiciones', path: '/terminos' });
  return (<Doc title="Términos y condiciones">
    <p className="rounded-md bg-amber-50 p-3 text-sm text-amber-900">Texto base de referencia. Debe ser revisado por un abogado antes de publicarse.</p>
    <h2>Solicitudes y cotizaciones</h2><p>Enviar una solicitud no constituye un contrato. Los valores, plazos y condiciones solo son válidos cuando constan en una propuesta económica emitida por S&amp;L Construcciones y aceptada por el cliente.</p>
    <h2>Precios</h2><p>El precio de cada trabajo depende de la evaluación del proyecto. Las referencias del sitio son informativas.</p>
    <h2>Trabajos regulados</h2><p>Los trabajos de gas y electricidad deben cumplir la normativa chilena y ser ejecutados por instaladores autorizados cuando corresponda.</p>
    <h2>Uso de la cuenta</h2><p>Eres responsable de mantener la confidencialidad de tus credenciales.</p></Doc>);
}
export function NotFound() {
  useSeo({ title: 'Página no encontrada', noindex: true });
  return <div className="container-x pb-24 pt-44 text-center"><h1 className="text-5xl font-extrabold">404</h1><p className="mt-3 text-steel">La página que buscas no existe o fue movida.</p><Link to="/" className="btn-primary mt-6">Volver al inicio</Link></div>;
}
