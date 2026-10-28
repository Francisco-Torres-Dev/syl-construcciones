import { Facebook, Instagram, Linkedin, Mail, MessageCircle, Phone } from 'lucide-react';
import { Link } from 'react-router-dom';
import { WHATSAPP_INITIAL_MESSAGE } from '../lib/contact';
import { useSite } from '../lib/site';
import { Logo } from './Logo';

export function whatsappLink(number: string, text = WHATSAPP_INITIAL_MESSAGE) {
  return `https://wa.me/${number}?text=${encodeURIComponent(text)}`;
}

export function Footer() {
  const { settings: s, categories } = useSite();
  const services = categories.flatMap((c) => c.services);
  const social = [[s.social.instagram, Instagram, 'Instagram'], [s.social.facebook, Facebook, 'Facebook'], [s.social.linkedin, Linkedin, 'LinkedIn']] as const;
  return (
    <footer className="bg-ink text-white/70">
      <div className="container-x grid gap-10 py-16 md:grid-cols-4">
        <div className="md:col-span-1">
          <Logo variant="dark" className="h-10" />
          <p className="mt-4 text-sm">Construimos tus ideas. Transformamos tus espacios.</p>
          <div className="mt-4 flex gap-3">
            {social.filter(([u]) => u).map(([u, Icon, label]) => <a key={label} href={u} target="_blank" rel="noopener noreferrer" aria-label={label} className="hover:text-brand"><Icon className="h-5 w-5" /></a>)}
          </div>
        </div>
        <div>
          <h3 className="mb-3 text-sm font-semibold text-white">Servicios</h3>
          <ul className="space-y-2 text-sm">{services.map((x) => <li key={x.id}><Link to={`/servicios/${x.slug}`} className="hover:text-brand">{x.name}</Link></li>)}</ul>
        </div>
        <div>
          <h3 className="mb-3 text-sm font-semibold text-white">Navegación</h3>
          <ul className="space-y-2 text-sm">
            {[['/proyectos', 'Proyectos'], ['/nosotros', 'Nosotros'], ['/consejos', 'Consejos'], ['/cotizar', 'Solicitar cotización'], ['/ingresar', 'Mi cuenta'], ['/privacidad', 'Política de privacidad'], ['/terminos', 'Términos y condiciones']].map(([to, l]) => <li key={to}><Link to={to} className="hover:text-brand">{l}</Link></li>)}
          </ul>
        </div>
        <div>
          <h3 className="mb-3 text-sm font-semibold text-white">Contacto</h3>
          <ul className="space-y-2 text-sm">
            <li className="flex items-center gap-2"><Mail className="h-4 w-4 text-brand" /><a href={`mailto:${s.email}`} className="hover:text-brand">{s.email}</a></li>
            {s.phone && <li className="flex items-center gap-2"><Phone className="h-4 w-4 text-brand" />{s.phone}</li>}
            {s.whatsapp && <li className="flex items-center gap-2"><MessageCircle className="h-4 w-4 text-brand" /><a href={whatsappLink(s.whatsapp)} className="hover:text-brand" target="_blank" rel="noopener noreferrer">WhatsApp</a></li>}
            {s.hours && <li>{s.hours}</li>}
          </ul>
        </div>
      </div>
      <div className="border-t border-white/10 py-5 text-center text-xs">© {new Date().getFullYear()} S&amp;L Construcciones. Todos los derechos reservados.</div>
    </footer>
  );
}
