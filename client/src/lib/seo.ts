import { useEffect } from 'react';

const SITE = 'S&L Construcciones';
// Dominio provisional: configúralo en VITE_SITE_URL cuando el dominio esté registrado.
export const SITE_URL = (import.meta.env.VITE_SITE_URL as string | undefined) ?? 'https://slconstrucciones.cl';

function setMeta(attr: 'name' | 'property', key: string, content: string) {
  let el = document.head.querySelector<HTMLMetaElement>(`meta[${attr}="${key}"]`);
  if (!el) { el = document.createElement('meta'); el.setAttribute(attr, key); document.head.appendChild(el); }
  el.content = content;
}

export function useSeo(opts: { title?: string; description?: string; path?: string; jsonLd?: object; noindex?: boolean }) {
  const { title, description, path, jsonLd, noindex } = opts;
  useEffect(() => {
    const full = title ? `${title} | ${SITE}` : `${SITE} — Construimos tus ideas. Transformamos tus espacios.`;
    document.title = full;
    if (description) { setMeta('name', 'description', description); setMeta('property', 'og:description', description); }
    setMeta('property', 'og:title', full);
    setMeta('name', 'robots', noindex ? 'noindex,nofollow' : 'index,follow');
    if (path !== undefined) {
      const url = SITE_URL + path;
      let link = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]');
      if (!link) { link = document.createElement('link'); link.rel = 'canonical'; document.head.appendChild(link); }
      link.href = url;
      setMeta('property', 'og:url', url);
    }
    let script = document.getElementById('ld-json');
    if (jsonLd) {
      if (!script) { script = document.createElement('script'); script.id = 'ld-json'; script.setAttribute('type', 'application/ld+json'); document.head.appendChild(script); }
      script.textContent = JSON.stringify(jsonLd);
    } else script?.remove();
  }, [title, description, path, jsonLd, noindex]);
}
