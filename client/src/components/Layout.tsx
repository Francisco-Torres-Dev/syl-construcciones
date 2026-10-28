import { MessageCircle } from 'lucide-react';
import { useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { WHATSAPP_NUMBER } from '../lib/contact';
import { Footer, whatsappLink } from './Footer';
import { Header } from './Header';

export function Layout() {
  const { pathname } = useLocation();
  useEffect(() => { window.scrollTo(0, 0); }, [pathname]);
  return (
    <>
      <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:left-3 focus:top-3 focus:z-[60] focus:rounded focus:bg-brand focus:px-3 focus:py-2">Ir al contenido</a>
      <Header />
      <main id="main"><Outlet /></main>
      <Footer />
      <a href={whatsappLink(WHATSAPP_NUMBER)} target="_blank" rel="noopener noreferrer" aria-label="Escribir por WhatsApp" title="Escríbenos por WhatsApp"
        className="fixed bottom-5 right-5 z-40 grid h-14 w-14 place-items-center rounded-full bg-[#25D366] text-white shadow-lg transition hover:scale-105"><MessageCircle /></a>
    </>
  );
}
