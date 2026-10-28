export function Logo({ variant = 'light', className = 'h-9' }: { variant?: 'light' | 'dark'; className?: string }) {
  // "light" = versión para fondos claros · "dark" = versión para fondos oscuros
  return <img src={`/brand/sl-logo-${variant}.svg`} alt="S&L Construcciones" className={className} width={260} height={64} />;
}
