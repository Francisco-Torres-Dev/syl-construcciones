import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { CONTACT_EMAIL, WHATSAPP_NUMBER } from './contact';
import { api } from './api';
import { SERVICE_CATEGORIES } from './services';
import type { Category, Settings } from './types';

const defaults: Settings = {
  businessName: 'S&L Construcciones', email: CONTACT_EMAIL, phone: '', whatsapp: WHATSAPP_NUMBER, coverage: [], hours: '', about: '',
  social: { instagram: '', facebook: '', linkedin: '' }, emailIsProvisional: false,
};
type SiteCtx = { settings: Settings; categories: Category[]; loaded: boolean; error: boolean };
const Ctx = createContext<SiteCtx>({ settings: defaults, categories: SERVICE_CATEGORIES, loaded: true, error: false });
export const useSite = () => useContext(Ctx);

export function SiteProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<SiteCtx>({ settings: defaults, categories: SERVICE_CATEGORIES, loaded: false, error: false });
  useEffect(() => {
    api<Settings>('/settings')
      .then((settings) => setState({ settings, categories: SERVICE_CATEGORIES, loaded: true, error: false }))
      .catch(() => setState((p) => ({ ...p, loaded: true, error: true })));
  }, []);
  return <Ctx.Provider value={state}>{children}</Ctx.Provider>;
}
