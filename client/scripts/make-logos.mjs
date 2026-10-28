// Genera los logos de S&L Construcciones (SVG con texto convertido a trazos + PNG).
// Uso: npm run logos
import opentype from 'opentype.js';
import sharp from 'sharp';
import fs from 'fs';
import path from 'path';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);
const fontFile = path.join(path.dirname(require.resolve('@fontsource/manrope/package.json')), 'files/manrope-latin-800-normal.woff');
const font = opentype.parse(fs.readFileSync(fontFile).buffer.slice(0));
const outDir = path.resolve('public/brand');
fs.mkdirSync(outDir, { recursive: true });

const ORANGE = '#F28C28';

function textPath(text, x, y, size, spacing = 0) {
  let cx = x;
  let d = '';
  for (const ch of text) {
    const g = font.charToGlyph(ch);
    d += g.getPath(cx, y, size).toPathData(2);
    cx += (g.advanceWidth / font.unitsPerEm) * size + spacing;
  }
  return { d, width: cx - x - spacing };
}

// Símbolo: techumbre en naranjo sobre estructura (muros y pilar central).
const mark = (ink) => `
  <path d="M2 30 32 6l30 24v9L32 15 2 39z" fill="${ORANGE}"/>
  <path d="M12 38v22h40V38" fill="none" stroke="${ink}" stroke-width="5" stroke-linejoin="miter"/>
  <rect x="29" y="40" width="6" height="20" fill="${ORANGE}"/>`;

function horizontal(ink) {
  const s = textPath('S&L', 0, 0, 40, 1);
  const c = textPath('CONSTRUCCIONES', 0, 0, 11.2, 3.2);
  const W = 76 + Math.max(s.width, c.width) + 4;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${Math.ceil(W)} 64" role="img" aria-label="S&amp;L Construcciones">
  <title>S&amp;L Construcciones</title>
  <g>${mark(ink)}</g>
  <g transform="translate(76 36)"><path d="${s.d}" fill="${ink}"/></g>
  <g transform="translate(77 56)"><path d="${c.d}" fill="${ORANGE}"/></g>
</svg>`;
}

function square(ink, bg) {
  const s = textPath('S&L', 0, 0, 44, 1);
  const c = textPath('CONSTRUCCIONES', 0, 0, 10.5, 3.4);
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" role="img" aria-label="S&amp;L Construcciones">
  <title>S&amp;L Construcciones</title>
  ${bg ? `<rect width="200" height="200" rx="28" fill="${bg}"/>` : ''}
  <g transform="translate(68 24) scale(1)">${mark(ink)}</g>
  <g transform="translate(${100 - s.width / 2} 136)"><path d="${s.d}" fill="${ink}"/></g>
  <g transform="translate(${100 - c.width / 2} 164)"><path d="${c.d}" fill="${ORANGE}"/></g>
</svg>`;
}

const files = {
  'sl-logo-horizontal.svg': horizontal('#202328'), // para fondos claros
  'sl-logo-light.svg': horizontal('#202328'),      // versión para fondos claros
  'sl-logo-dark.svg': horizontal('#FFFFFF'),       // versión para fondos oscuros
  'sl-logo-square.svg': square('#202328', '#FFFFFF'),
  'sl-logo-square-dark.svg': square('#FFFFFF', '#141619'),
};
for (const [name, svg] of Object.entries(files)) fs.writeFileSync(path.join(outDir, name), svg);

fs.writeFileSync(path.resolve('public/favicon.svg'), `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect width="64" height="64" rx="12" fill="#141619"/><g transform="translate(6 6) scale(.8)">${mark('#FFFFFF')}</g></svg>`);

// PNG reales (fondo transparente en el horizontal; fondo blanco en el cuadrado)
await sharp(Buffer.from(files['sl-logo-horizontal.svg']), { density: 300 }).resize({ width: 1200 }).png().toFile(path.join(outDir, 'sl-logo-horizontal.png'));
await sharp(Buffer.from(files['sl-logo-square.svg']), { density: 300 }).resize({ width: 1024, height: 1024 }).png().toFile(path.join(outDir, 'sl-logo-square.png'));
console.log('Logos generados en public/brand');
