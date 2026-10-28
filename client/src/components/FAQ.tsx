import { ChevronDown } from 'lucide-react';

export const GENERAL_FAQ = [
  ['¿Qué servicios ofrecen?', 'Construcción y ampliaciones, techumbres y cobertizos, obras civiles, remodelaciones y terminaciones, instalaciones, habilitación de locales comerciales, asesorías y reparaciones menores.'],
  ['¿Cómo se calculan los presupuestos?', 'Cada proyecto se evalúa por separado: superficie, materiales, accesos, plazos y complejidad. Por eso no publicamos precios fijos; la propuesta detalla montos, materiales, plazos, condiciones y exclusiones.'],
  ['¿Realizan visitas técnicas?', 'Cuando el proyecto lo requiere, coordinamos una visita técnica para evaluar el lugar antes de cotizar. Puedes solicitarla en el formulario de cotización.'],
  ['¿Cuáles son los plazos?', 'Dependen del alcance de la obra y de la disponibilidad de materiales. El plazo estimado se indica en la propuesta.'],
  ['¿Pueden trabajar con los materiales que yo elija?', 'Sí. También podemos orientarte sobre alternativas según uso, durabilidad y presupuesto.'],
  ['¿Cuál es su cobertura?', 'Las zonas de cobertura se informan en el sitio una vez definidas. Si tu comuna no aparece, consúltanos igualmente.'],
  ['¿Cómo se contrata un trabajo?', 'Envías tu solicitud, evaluamos el proyecto, te entregamos una propuesta económica y, una vez que la aceptas, coordinamos la ejecución.'],
];

export function FAQ({ items = GENERAL_FAQ.map(([q, a]) => ({ q, a })) }: { items?: { q: string; a: string }[] }) {
  return (
    <div className="divide-y divide-graphite/10 border-y border-graphite/10">
      {items.map((f) => (
        <details key={f.q} className="group py-4">
          <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-display text-lg font-semibold">{f.q}<ChevronDown className="h-5 w-5 shrink-0 text-brand transition group-open:rotate-180" /></summary>
          <p className="mt-3 text-steel">{f.a}</p>
        </details>
      ))}
    </div>
  );
}
