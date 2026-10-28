import { AnimatePresence, motion } from 'motion/react';
import { Menu, UserRound, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '../lib/auth';
import { Logo } from './Logo';

const NAV = [['/', 'Inicio'], ['/servicios', 'Servicios'], ['/proyectos', 'Proyectos'], ['/nosotros', 'Nosotros'], ['/consejos', 'Consejos'], ['/contacto', 'Contacto']] as const;

export function Header() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { pathname } = useLocation();
  const { user } = useAuth();
  const solid = scrolled || pathname !== '/' || open;

  useEffect(() => { const f = () => setScrolled(window.scrollY > 24); f(); window.addEventListener('scroll', f, { passive: true }); return () => window.removeEventListener('scroll', f); }, []);
  useEffect(() => setOpen(false), [pathname]);
  useEffect(() => { document.body.style.overflow = open ? 'hidden' : ''; return () => { document.body.style.overflow = ''; }; }, [open]);

  return (
    <header className={`fixed inset-x-0 top-0 z-50 transition-colors duration-300 ${solid ? 'bg-ink/95 backdrop-blur' : 'bg-transparent'}`}>
      <div className="container-x flex h-[72px] items-center justify-between">
        <Link to="/" aria-label="S&L Construcciones, inicio"><Logo variant="dark" className="h-9" /></Link>
        <nav aria-label="Principal" className="hidden lg:block">
          <ul className="flex items-center gap-8">
            {NAV.map(([to, label]) => (
              <li key={to}><NavLink to={to} end={to === '/'} className={({ isActive }) => `relative py-2 text-sm font-medium transition-colors ${isActive ? 'text-white' : 'text-white/70 hover:text-white'}`}>
                {({ isActive }) => <>{label}{isActive && <motion.span layoutId="nav-ind" className="absolute inset-x-0 -bottom-0.5 h-0.5 bg-brand" />}</>}
              </NavLink></li>
            ))}
          </ul>
        </nav>
        <div className="hidden items-center gap-3 lg:flex">
          <Link to={user ? (user.role === 'ADMIN' ? '/admin' : '/cuenta') : '/ingresar'} className="flex items-center gap-2 text-sm text-white/80 hover:text-white"><UserRound className="h-4 w-4" />{user ? 'Mi cuenta' : 'Ingresar'}</Link>
          <Link to="/cotizar" className="btn-primary">Solicitar cotización</Link>
        </div>
        <button className="p-2 text-white lg:hidden" onClick={() => setOpen(!open)} aria-expanded={open} aria-controls="mobile-menu" aria-label={open ? 'Cerrar menú' : 'Abrir menú'}>
          {open ? <X /> : <Menu />}
        </button>
      </div>
      <AnimatePresence>
        {open && (
          <motion.div id="mobile-menu" initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden bg-ink lg:hidden">
            <ul className="container-x flex flex-col gap-1 pb-6 pt-2">
              {NAV.map(([to, label]) => (
                <li key={to}><NavLink to={to} end={to === '/'} className={({ isActive }) => `block border-l-2 py-3 pl-4 text-base ${isActive ? 'border-brand text-white' : 'border-transparent text-white/70'}`}>{label}</NavLink></li>
              ))}
              <li className="mt-3"><Link to={user ? (user.role === 'ADMIN' ? '/admin' : '/cuenta') : '/ingresar'} className="block py-3 pl-4 text-white/80">{user ? 'Mi cuenta' : 'Ingresar / Registrarme'}</Link></li>
              <li><Link to="/cotizar" className="btn-primary mt-2 w-full">Solicitar cotización</Link></li>
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
