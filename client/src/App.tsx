import { lazy, Suspense } from 'react';
import { Route, Routes } from 'react-router-dom';
import { Layout } from './components/Layout';
import { Protected, Spinner } from './components/ui';
import Home from './pages/Home';
import Projects from './pages/Projects';
import Quote from './pages/Quote';
import { ServiceDetail, ServicesIndex } from './pages/Services';
import { About, Contact, NotFound, Privacy, Terms, Tips } from './pages/Static';
import { Forgot, Login, Register, Reset, Verify } from './pages/Auth';

// Las áreas privadas se cargan bajo demanda para mantener liviano el bundle público.
const Account = lazy(() => import('./pages/Account'));
const AccountQuote = lazy(() => import('./pages/Account').then((m) => ({ default: m.AccountQuote })));
const A = (n: string) => lazy(() => import('./pages/Admin').then((m) => ({ default: (m as any)[n] }))); // eslint-disable-line @typescript-eslint/no-explicit-any
const AdminLayout = A('AdminLayout'), AdminDashboard = A('AdminDashboard'), AdminQuotes = A('AdminQuotes'), AdminQuoteDetail = A('AdminQuoteDetail'),
  AdminCustomers = A('AdminCustomers'), AdminSettings = A('AdminSettings');

export default function App() {
  return (
    <Suspense fallback={<Spinner />}>
      <Routes>
        <Route element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="servicios" element={<ServicesIndex />} />
          <Route path="servicios/:slug" element={<ServiceDetail />} />
          <Route path="proyectos" element={<Projects />} />
          <Route path="nosotros" element={<About />} />
          <Route path="consejos" element={<Tips />} />
          <Route path="contacto" element={<Contact />} />
          <Route path="cotizar" element={<Quote />} />
          <Route path="privacidad" element={<Privacy />} />
          <Route path="terminos" element={<Terms />} />
          <Route path="cuenta" element={<Protected><Account /></Protected>} />
          <Route path="cuenta/solicitudes/:id" element={<Protected><AccountQuote /></Protected>} />
          <Route path="*" element={<NotFound />} />
        </Route>
        <Route path="ingresar" element={<Login />} />
        <Route path="registro" element={<Register />} />
        <Route path="recuperar" element={<Forgot />} />
        <Route path="restablecer" element={<Reset />} />
        <Route path="verificar" element={<Verify />} />
        <Route path="admin" element={<Protected admin><AdminLayout /></Protected>}>
          <Route index element={<AdminDashboard />} />
          <Route path="solicitudes" element={<AdminQuotes />} />
          <Route path="solicitudes/:id" element={<AdminQuoteDetail />} />
          <Route path="clientes" element={<AdminCustomers />} />
          <Route path="configuracion" element={<AdminSettings />} />
        </Route>
      </Routes>
    </Suspense>
  );
}
