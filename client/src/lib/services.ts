import type { Category } from './types';

const pricingNote = 'El valor final depende de la evaluación de cada proyecto: superficie, materiales, accesos y plazos.';

export const SERVICE_CATEGORIES: Category[] = [
  {
    id: 'obra-gruesa-y-exteriores',
    slug: 'obra-gruesa-y-exteriores',
    name: 'Obra gruesa y exteriores',
    description: 'Estructuras, techumbres y obras civiles para dar forma a tu proyecto.',
    services: [
      {
        id: 'construccion-y-ampliaciones', slug: 'construccion-y-ampliaciones', name: 'Construcción y ampliaciones',
        summary: 'Viviendas, obras nuevas, ampliaciones y segundos pisos.',
        description: 'Desarrollamos desde una ampliación de tu casa hasta una vivienda nueva, coordinando fundaciones, estructura y terminaciones.',
        scope: 'Evaluación del terreno o vivienda existente, definición de la solución constructiva y ejecución por etapas.',
        includes: ['Construcción de viviendas', 'Obras nuevas', 'Ampliaciones', 'Segundos pisos', 'Fundaciones y cimientos', 'Radieres', 'Tabiquería', 'Estructuras metálicas y de madera', 'Cierres perimetrales', 'Quinchos', 'Terrazas'],
        faqs: [
          { q: '¿Necesito permiso para ampliar mi casa?', a: 'Depende del tipo y la superficie de la obra y de la normativa de tu comuna. En la evaluación inicial revisamos qué trámites corresponden.' },
          { q: '¿Se puede ampliar sin dejar de vivir en la casa?', a: 'En muchos casos sí, planificando las etapas. Lo confirmamos tras la visita técnica.' },
        ],
        info: `Algunas obras requieren permisos municipales y, en ciertos casos, profesionales habilitados. Te orientamos sobre lo que corresponde a tu proyecto. ${pricingNote}`,
        published: true, sortOrder: 0, categoryId: 'obra-gruesa-y-exteriores',
      },
      {
        id: 'techumbres-y-cobertizos', slug: 'techumbres-y-cobertizos', name: 'Techumbres y cobertizos',
        summary: 'Instalación y reparación de techos, cobertizos y terrazas techadas.',
        description: 'Instalamos, reparamos y renovamos cubiertas, además de soluciones para el escurrimiento de aguas lluvias.',
        scope: 'Revisión del estado de la cubierta o del espacio a techar, definición de materiales y ejecución.',
        includes: ['Instalación de techumbres', 'Reparación de techos', 'Cambio de cubiertas', 'Cobertizos para vehículos', 'Terrazas techadas', 'Canaletas', 'Bajadas de aguas lluvias', 'Impermeabilización'],
        faqs: [
          { q: '¿Pueden reparar una gotera puntual?', a: 'Sí. Para ubicar el origen conviene una visita técnica; envíanos fotografías en tu solicitud.' },
          { q: '¿Qué materiales de cubierta existen?', a: 'Hay varias alternativas según presupuesto, clima y estética. Te orientamos al preparar la propuesta.' },
        ],
        info: pricingNote, published: true, sortOrder: 1, categoryId: 'obra-gruesa-y-exteriores',
      },
      {
        id: 'obras-civiles-y-exteriores', slug: 'obras-civiles-y-exteriores', name: 'Obras civiles y exteriores',
        summary: 'Pavimentación, accesos, veredas, excavaciones y movimiento de tierra.',
        description: 'Preparamos el terreno y ejecutamos las obras exteriores que tu propiedad necesita.',
        scope: 'Levantamiento del sitio, preparación de superficies y ejecución de pavimentos y obras complementarias.',
        includes: ['Pavimentación', 'Radieres de hormigón', 'Accesos vehiculares', 'Veredas', 'Preparación de terrenos', 'Excavaciones', 'Movimiento de tierra', 'Fundaciones', 'Obras complementarias'],
        faqs: [{ q: '¿Qué datos necesito para cotizar un radier?', a: 'Dimensiones aproximadas, uso (peatonal o vehicular) y fotografías del lugar.' }],
        info: pricingNote, published: true, sortOrder: 2, categoryId: 'obra-gruesa-y-exteriores',
      },
    ],
  },
  {
    id: 'interiores-e-instalaciones',
    slug: 'interiores-e-instalaciones',
    name: 'Interiores e instalaciones',
    description: 'Remodelaciones, instalaciones y habilitación de espacios comerciales.',
    services: [
      {
        id: 'remodelaciones-y-terminaciones', slug: 'remodelaciones-y-terminaciones', name: 'Remodelaciones y terminaciones',
        summary: 'Cocinas, baños, pisos, pintura, revestimientos y terminaciones.',
        description: 'Renovamos los espacios de tu hogar con terminaciones prolijas y materiales acordes a tu presupuesto.',
        scope: 'Levantamiento de medidas, definición de materiales y ejecución coordinada de cada especialidad.',
        includes: ['Remodelación de cocinas', 'Remodelación de baños', 'Instalación de cerámicos', 'Porcelanatos', 'Instalación de pisos', 'Pintura interior y exterior', 'Revestimientos', 'Puertas y ventanas', 'Reparación de muros', 'Terminaciones'],
        faqs: [
          { q: '¿Puedo elegir yo los materiales?', a: 'Sí. También podemos orientarte según uso, durabilidad y presupuesto.' },
          { q: '¿Cuánto dura una remodelación de baño?', a: 'Depende del alcance. El plazo se indica en la propuesta.' },
        ],
        info: pricingNote, published: true, sortOrder: 0, categoryId: 'interiores-e-instalaciones',
      },
      {
        id: 'instalaciones-y-mantenciones', slug: 'instalaciones-y-mantenciones', name: 'Instalaciones y mantenciones',
        summary: 'Gasfitería, calefones, filtraciones, iluminación y mantención del hogar.',
        description: 'Instalaciones y reparaciones domiciliarias, desde una grifería hasta redes de agua.',
        scope: 'Diagnóstico del problema, propuesta de solución y ejecución.',
        includes: ['Gasfitería', 'Reparación de filtraciones', 'Instalación de grifería', 'Instalación de sanitarios', 'Redes de agua', 'Calefones', 'Termos', 'Iluminación', 'Instalaciones eléctricas', 'Mantención general del hogar'],
        faqs: [{ q: '¿Instalan calefones?', a: 'Es un trabajo de gas: debe hacerlo un instalador autorizado y cumplir la normativa. Consúltanos por tu caso al cotizar.' }],
        info: `Los trabajos de gas y electricidad deben cumplir la normativa chilena aplicable y ser ejecutados por instaladores autorizados cuando corresponda. ${pricingNote}`,
        published: true, sortOrder: 1, categoryId: 'interiores-e-instalaciones',
      },
      {
        id: 'locales-comerciales-y-cafeterias', slug: 'locales-comerciales-y-cafeterias', name: 'Locales comerciales y cafeterías',
        summary: 'Habilitación y remodelación de cafeterías, restaurantes, oficinas y tiendas.',
        description: 'Construimos y habilitamos el espacio físico de tu negocio. No operamos ni administramos cafeterías o restaurantes: nuestro servicio es la obra.',
        scope: 'Adecuación de espacios interiores, mobiliario fijo, revestimientos, iluminación y terminaciones.',
        includes: ['Habilitación de cafeterías', 'Remodelación de restaurantes', 'Habilitación de oficinas', 'Habilitación de tiendas', 'Barras y mobiliario fijo', 'Revestimientos comerciales', 'Iluminación', 'Terminaciones', 'Adecuación de espacios interiores'],
        faqs: [{ q: '¿Gestionan permisos de funcionamiento?', a: 'Nos enfocamos en la construcción y habilitación. Te orientamos sobre las adecuaciones físicas que suelen exigirse.' }],
        info: `Los requisitos sanitarios y municipales de cada local son responsabilidad del titular; podemos coordinar la parte constructiva. ${pricingNote}`,
        published: true, sortOrder: 2, categoryId: 'interiores-e-instalaciones',
      },
    ],
  },
  {
    id: 'asesoria-y-mantencion',
    slug: 'asesoria-y-mantencion',
    name: 'Asesoría y mantención',
    description: 'Evaluación previa de proyectos y reparaciones del día a día.',
    services: [
      {
        id: 'asesorias', slug: 'asesorias', name: 'Asesorías',
        summary: 'Evaluación preliminar, visitas técnicas, cubicaciones y planificación.',
        description: 'Antes de construir, ordena tu proyecto: alcance, materiales, costos estimados y etapas.',
        scope: 'Visita técnica, levantamiento, cubicación y estimación de costos.',
        includes: ['Evaluación preliminar de proyectos', 'Visitas técnicas', 'Cubicaciones', 'Estimación de costos', 'Planificación de obras', 'Orientación sobre materiales', 'Coordinación de especialidades'],
        faqs: [{ q: '¿La visita técnica tiene costo?', a: 'Las condiciones se informan al coordinar la visita.' }],
        info: pricingNote, published: true, sortOrder: 0, categoryId: 'asesoria-y-mantencion',
      },
      {
        id: 'reparaciones-menores', slug: 'reparaciones-menores', name: 'Reparaciones menores',
        summary: 'Reparaciones del hogar, ajustes, mantenciones y trabajos menores.',
        description: 'Para esos arreglos pendientes que no justifican una gran obra, pero sí buena mano de obra.',
        scope: 'Revisión del trabajo, propuesta clara y ejecución.',
        includes: ['Reparaciones del hogar', 'Mantenciones', 'Ajustes y terminaciones', 'Reparaciones puntuales de techumbres', 'Mejoras de espacios exteriores', 'Trabajos menores de construcción'],
        faqs: [{ q: '¿Atienden trabajos pequeños?', a: 'Sí. Cuéntanos qué necesitas y envía fotografías.' }],
        info: pricingNote, published: true, sortOrder: 1, categoryId: 'asesoria-y-mantencion',
      },
    ],
  },
];
