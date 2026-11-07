/**
 * Regenerates public/og_image.png (1200x630 social share card).
 *
 * Plain copy on the left. On the right, the idea itself: a zoomed-in patch of
 * image pixels (sky over a field), with a run of accent pixels carrying the
 * bits of a hidden message in reading order. Colours match the app's light
 * theme and its default teal accent.
 *
 * Usage: node scripts/cover.mjs
 */
import { writeFile } from 'node:fs/promises';
import { join } from 'node:path';

import { INK, PAPER, launchBrowser, markSvg } from './brand.mjs';

const ROOT = new URL('..', import.meta.url).pathname;
const OUT = join(ROOT, 'public/og_image.png');

const ACCENT = '#0e7468';
const MUTED = '#5d666b';
const BORDER = '#e1e5e6';

const ICON = (paths, size = 18, color = 'currentColor') =>
  `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${paths}</svg>`;
const SHIELD =
  '<path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"/><path d="m9 12 2 2 4-4"/>';

/* Pixel field ------------------------------------------------------------ */

const CELL = 46;
const GAP = 6;
const COLS = 12;
const ROWS = 13;
/** Where the pixel field starts; it bleeds off the top, right and bottom. */
const FIELD = { left: 660, top: -22 };
/** Row index of the horizon: sky above, field below. */
const HORIZON = 6;
/** "h" and "i" in 8-bit ASCII, one byte per row, one bit per pixel. */
const BYTES = ['01101000', '01101001'];
/** First pixel of the run, as [row, column]; each byte starts a new row. */
const RUN_START = [4, 2];

/** Small seeded PRNG so every render is identical. */
function random(seed) {
  let state = seed;
  return () => {
    state = (state * 1664525 + 1013904223) % 4294967296;
    return state / 4294967296;
  };
}

const mix = (a, b, t) => a.map((v, i) => Math.round(v + (b[i] - v) * t));
const hex = (rgb) =>
  `#${rgb.map((v) => v.toString(16).padStart(2, '0')).join('')}`;

function pixelColour(row, col, noise) {
  const sky = mix([214, 232, 238], [168, 205, 219], row / (HORIZON - 1));
  const field = mix(
    [150, 184, 152],
    [96, 138, 104],
    (row - HORIZON) / (ROWS - HORIZON - 1),
  );
  const base = row < HORIZON ? sky : field;
  // A soft sun glow in the upper right, plus per-pixel grain.
  const sun = Math.max(0, 1 - Math.hypot(col - 9, row - 1.5) / 3.2);
  const warm = mix(base, [250, 232, 196], row < HORIZON ? sun * 0.8 : 0);
  const grain = (noise - 0.5) * 14;
  return hex(
    warm.map((v) => Math.max(0, Math.min(255, Math.round(v + grain)))),
  );
}

function fieldHtml() {
  const next = random(7);
  const run = new Map();
  const [startRow, startCol] = RUN_START;
  BYTES.forEach((byte, line) => {
    [...byte].forEach((bit, i) => {
      run.set(`${startRow + line}:${startCol + i}`, bit);
    });
  });

  let cells = '';
  for (let row = 0; row < ROWS; row++) {
    for (let col = 0; col < COLS; col++) {
      const x = FIELD.left + col * (CELL + GAP);
      const y = FIELD.top + row * (CELL + GAP);
      const noise = next();
      const bit = run.get(`${row}:${col}`);
      cells += bit
        ? `<div class="px bit" style="left:${x}px;top:${y}px">${bit}</div>`
        : `<div class="px" style="left:${x}px;top:${y}px;background:${pixelColour(row, col, noise)}"></div>`;
    }
  }
  return `<div class="field">${cells}</div>`;
}

function cardHtml() {
  return `<!doctype html><html><head><meta charset="utf-8"><style>
    * { margin: 0; box-sizing: border-box; }
    body {
      position: relative; width: 1200px; height: 630px; overflow: hidden; background: ${PAPER};
      color: ${INK};
      font-family: ui-sans-serif, system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      -webkit-font-smoothing: antialiased;
    }
    .field { position: absolute; inset: 0;
      -webkit-mask-image: linear-gradient(90deg, transparent 640px, #000 790px); }
    .px { position: absolute; width: ${CELL}px; height: ${CELL}px; border-radius: 8px; }
    .bit { display: grid; place-items: center; background: ${ACCENT}; color: #fff;
      font: 600 20px ui-monospace, 'SF Mono', SFMono-Regular, Menlo, Consolas, monospace;
      box-shadow: 0 6px 14px rgb(14 116 104 / 0.28); }
    .copy { position: relative; display: flex; flex-direction: column; justify-content: center; height: 100%; padding: 0 80px; max-width: 700px; }
    .brand { display: flex; align-items: center; gap: 14px; font-size: 28px; font-weight: 650; letter-spacing: -0.4px; }
    h1 { margin-top: 44px; font-size: 64px; line-height: 1.04; font-weight: 700; letter-spacing: -2px; }
    p.tag { margin-top: 22px; font-size: 24px; line-height: 1.45; color: ${MUTED}; max-width: 520px; }
    .facts { display: flex; gap: 10px; margin-top: 36px; }
    .fact { display: flex; align-items: center; white-space: nowrap; gap: 8px; font-size: 17px; font-weight: 550; padding: 9px 14px; border: 1px solid ${BORDER}; border-radius: 999px; background: #fff; }
    .fact svg { color: ${ACCENT}; }
  </style></head><body>
    ${fieldHtml()}
    <div class="copy">
      <div class="brand">${markSvg({ size: 48 })}Digi-Cloak</div>
      <h1>Hide a message<br>inside an image</h1>
      <p class="tag">Encrypt text with a password and write it into a picture's pixels. Free, and it runs in your browser.</p>
      <div class="facts">
        <span class="fact">${ICON(SHIELD)}Nothing uploaded</span>
        <span class="fact">AES-256-GCM</span>
        <span class="fact">LSB steganography</span>
      </div>
    </div>
  </body></html>`;
}

const browser = await launchBrowser();
try {
  const page = await browser.newPage({
    viewport: { width: 1200, height: 630 },
    deviceScaleFactor: 1,
  });
  await page.setContent(cardHtml(), { waitUntil: 'networkidle' });
  const og = await page.screenshot({
    clip: { x: 0, y: 0, width: 1200, height: 630 },
  });
  await writeFile(OUT, og);
  console.log(`Wrote ${OUT} (${(og.length / 1024).toFixed(0)} KB)`);
} finally {
  await browser.close();
}
