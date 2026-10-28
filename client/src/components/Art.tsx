// Ilustraciones arquitectónicas en línea. Sirven como marcador visual hasta cargar fotografías reales.
const stroke = { fill: 'none', strokeWidth: 2, vectorEffect: 'non-scaling-stroke' as const };

export function Art({ variant = 0, className = '' }: { variant?: number; className?: string }) {
  const v = variant % 4;
  return (
    <svg viewBox="0 0 400 300" className={className} preserveAspectRatio="xMidYMid slice" role="img" aria-hidden="true">
      <rect width="400" height="300" fill="#202328" />
      <g stroke="#ffffff" strokeOpacity=".07" strokeWidth="1">
        {Array.from({ length: 11 }).map((_, i) => <path key={'v' + i} d={`M${i * 40} 0V300`} />)}
        {Array.from({ length: 8 }).map((_, i) => <path key={'h' + i} d={`M0 ${i * 40}H400`} />)}
      </g>
      {v === 0 && <g {...stroke}><path d="M60 150 200 50l140 100" stroke="#F28C28" strokeWidth="3" /><path d="M80 150v110h240V150M170 260v-70h60v70M250 180h50v40h-50z" stroke="#fff" strokeOpacity=".7" /></g>}
      {v === 1 && <g {...stroke}><path d="M40 120h320l-30-30H70z" stroke="#F28C28" strokeWidth="3" /><path d="M70 120v140M330 120v140M70 260h260M120 200h160v60H120z" stroke="#fff" strokeOpacity=".7" /><path d="M150 200l10-22h80l10 22" stroke="#fff" strokeOpacity=".5" /></g>}
      {v === 2 && <g {...stroke}><path d="M50 250V70h300v180z" stroke="#fff" strokeOpacity=".7" /><path d="M50 160h300M150 70v180M230 160v90" stroke="#F28C28" strokeWidth="3" /><path d="M170 110h40M250 100h70" stroke="#fff" strokeOpacity=".5" /></g>}
      {v === 3 && <g {...stroke}><path d="M60 90h280v160H60z" stroke="#fff" strokeOpacity=".7" /><path d="M60 90l20-30h240l20 30" stroke="#F28C28" strokeWidth="3" /><path d="M100 180h200M120 180v70M280 180v70M170 130a14 14 0 1 0 0 .1M230 130a14 14 0 1 0 0 .1" stroke="#fff" strokeOpacity=".6" /></g>}
    </svg>
  );
}
