export type PortfolioImage = { src: string; alt: string };
export type PortfolioProject = {
  id: string;
  title: string;
  category: string;
  description: string;
  images: PortfolioImage[];
};

export const PROJECTS: PortfolioProject[] = [
  {
    id: 'instalacion-de-piso',
    title: 'Instalación de piso',
    category: 'Pisos y terminaciones',
    description: 'Renovación de piso con instalación cuidadosa de revestimientos y atención a los detalles de terminación.',
    images: [
      { src: '/projects/piso/IMG-20261025-WA0253.jpg', alt: 'Instalación de piso en desarrollo' },
      { src: '/projects/piso/IMG-20261025-WA0176.jpg', alt: 'Detalle del trabajo de instalación de piso' },
      { src: '/projects/piso/IMG-20261025-WA0261.jpg', alt: 'Piso instalado y sus terminaciones' },
    ],
  },
  {
    id: 'museo-parque-araucano',
    title: 'Museo en Parque Araucano',
    category: 'Habilitación de espacios',
    description: 'Trabajo de habilitación y terminaciones para un espacio museográfico ubicado en Parque Araucano.',
    images: [
      { src: '/projects/museo-parque-araucano/IMG-20261025-WA0299.jpg', alt: 'Proyecto del museo en Parque Araucano' },
      { src: '/projects/museo-parque-araucano/IMG-20261025-WA0295.jpg', alt: 'Detalle del espacio del museo' },
      { src: '/projects/museo-parque-araucano/IMG-20261025-WA0287.jpg', alt: 'Terminaciones del museo en Parque Araucano' },
      { src: '/projects/museo-parque-araucano/IMG-20261025-WA0277.jpg', alt: 'Trabajo de habilitación en el museo' },
    ],
  },
  {
    id: 'remodelacion-de-bano',
    title: 'Remodelación de baño',
    category: 'Remodelación de interiores',
    description: 'Renovación de baño con revestimientos, artefactos y terminaciones pensados para un espacio cómodo y funcional.',
    images: [
      { src: '/projects/bano/IMG-20261023-WA0018(1).jpg', alt: 'Baño remodelado con revestimiento y artefactos nuevos' },
      { src: '/projects/bano/IMG-20261023-WA0019.jpg', alt: 'Detalle de la remodelación del baño' },
      { src: '/projects/bano/IMG-20261023-WA0020.jpg', alt: 'Terminaciones del proyecto de baño' },
    ],
  },
  {
    id: 'remodelacion-de-oficina',
    title: 'Remodelación de oficina',
    category: 'Oficinas y espacios de trabajo',
    description: 'Mejoramiento de un espacio de trabajo mediante renovación de superficies y terminaciones interiores.',
    images: [
      { src: '/projects/oficina/IMG-20261025-WA0264.jpg', alt: 'Espacio de oficina remodelado' },
      { src: '/projects/oficina/IMG-20261025-WA0154.jpg', alt: 'Detalle de las terminaciones de oficina' },
      { src: '/projects/oficina/IMG-20261025-WA0151.jpg', alt: 'Trabajo de remodelación en la oficina' },
      { src: '/projects/oficina/IMG-20261025-WA0144.jpg', alt: 'Vista del proyecto de oficina' },
      { src: '/projects/oficina/IMG-20261025-WA0141.jpg', alt: 'Avance de remodelación de oficina' },
    ],
  },
];

const SERVICE_PHOTOS: Record<string, PortfolioImage> = {
  'construccion-y-ampliaciones': { src: '/services/construccion.svg', alt: 'Ilustración referencial de construcción y ampliaciones' },
  'techumbres-y-cobertizos': { src: '/services/techumbres.svg', alt: 'Ilustración referencial de techumbres y cobertizos' },
  'obras-civiles-y-exteriores': { src: '/services/obras-civiles.svg', alt: 'Ilustración referencial de obras civiles y exteriores' },
  'remodelaciones-y-terminaciones': { src: '/services/remodelaciones.svg', alt: 'Ilustración referencial de remodelaciones y terminaciones' },
  'instalaciones-y-mantenciones': { src: '/services/instalaciones.svg', alt: 'Ilustración referencial de instalaciones y mantenciones' },
  'locales-comerciales-y-cafeterias': { src: '/services/locales.svg', alt: 'Ilustración referencial de habilitación de espacios comerciales' },
  asesorias: { src: '/services/asesorias.svg', alt: 'Ilustración referencial de asesoría y planificación de proyectos' },
  'reparaciones-menores': { src: '/services/reparaciones.svg', alt: 'Ilustración referencial de reparaciones menores' },
};

export function servicePhotoFor(slug: string, fallbackIndex = 0): PortfolioImage {
  return SERVICE_PHOTOS[slug] ?? SERVICE_PHOTOS['construccion-y-ampliaciones'];
}
