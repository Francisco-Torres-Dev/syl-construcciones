import { X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { PageHead } from '../components/ui';
import { PROJECTS, type PortfolioProject } from '../lib/portfolio';
import { useSeo } from '../lib/seo';

export function ProjectGrid({ limit }: { limit?: number }) {
  const [filter, setFilter] = useState('Todos');
  const [open, setOpen] = useState<PortfolioProject | null>(null);
  const [activeImage, setActiveImage] = useState(0);
  const dlg = useRef<HTMLDialogElement>(null);

  useEffect(() => { if (open) dlg.current?.showModal(); }, [open]);

  const cats = ['Todos', ...Array.from(new Set(PROJECTS.map((p) => p.category)))];
  let list = filter === 'Todos' ? PROJECTS : PROJECTS.filter((p) => p.category === filter);
  if (limit) list = list.slice(0, limit);

  return (
    <>
      {!limit && <div className="mb-8 flex flex-wrap gap-2" role="group" aria-label="Filtrar por categoría">
        {cats.map((c) => <button key={c} onClick={() => setFilter(c)} aria-pressed={filter === c} className={`rounded-full border px-4 py-1.5 text-sm transition ${filter === c ? 'border-brand bg-brand text-ink' : 'border-graphite/20 hover:border-brand'}`}>{c}</button>)}
      </div>}
      <div className={`grid gap-5 sm:grid-cols-2 ${limit ? 'lg:grid-cols-4' : 'lg:grid-cols-3'}`}>
        {list.map((p) => (
          <button key={p.id} onClick={() => { setActiveImage(0); setOpen(p); }} className="group relative overflow-hidden rounded-lg text-left">
            <div className="aspect-[4/3] overflow-hidden bg-graphite">
              <img src={p.images[0].src} alt={p.images[0].alt} loading="lazy" className="h-full w-full object-cover transition duration-500 group-hover:scale-105" />
            </div>
            <div className="absolute inset-0 bg-gradient-to-t from-ink/85 via-transparent to-transparent" />
            <div className="absolute inset-x-0 bottom-0 p-4 text-white"><p className="text-xs text-brand">{p.category}</p><p className="font-display font-bold">{p.title}</p><p className="mt-1 text-xs text-white/75">Ver proyecto y fotografías</p></div>
          </button>
        ))}
      </div>
      <dialog ref={dlg} onClose={() => setOpen(null)} onClick={(e) => e.target === dlg.current && dlg.current?.close()} className="w-[92%] max-w-3xl rounded-lg p-0 backdrop:bg-black/60">
        {open && (
          <div>
            <div className="relative aspect-video bg-graphite">
              <img src={open.images[activeImage].src} alt={open.images[activeImage].alt} className="h-full w-full object-cover" />
              <button onClick={() => dlg.current?.close()} aria-label="Cerrar" className="absolute right-3 top-3 grid h-9 w-9 place-items-center rounded-full bg-black/60 text-white"><X className="h-4 w-4" /></button>
            </div>
            <div className="p-6">
              <p className="text-sm text-brand-dark">{open.category}</p>
              <h3 className="mt-1 text-2xl font-bold">{open.title}</h3>
              <p className="mt-3 text-steel">{open.description}</p>
              <div className="mt-5 grid grid-cols-3 gap-2 sm:grid-cols-5">
                {open.images.map((image, index) => (
                  <button key={image.src} onClick={() => setActiveImage(index)} aria-label={`Ver fotografía ${index + 1} de ${open.title}`} aria-pressed={activeImage === index} className={`overflow-hidden rounded border-2 ${activeImage === index ? 'border-brand' : 'border-transparent'}`}>
                    <img src={image.src} alt={image.alt} loading="lazy" className="aspect-square w-full object-cover" />
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </dialog>
    </>
  );
}

export default function Projects() {
  useSeo({ title: 'Proyectos', description: 'Galería de proyectos de construcción, remodelación y habilitación de S&L Construcciones.', path: '/proyectos' });
  return (<><PageHead title="Proyectos" intro="Una selección de trabajos de instalación, habilitación y remodelación realizados por S&L Construcciones." /><div className="section container-x"><ProjectGrid /></div></>);
}
