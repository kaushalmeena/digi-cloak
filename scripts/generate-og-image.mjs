/**
 * Regenerates src/assets/og_image.png (1200x630 social share card).
 *
 * A single Playwright render of a hand-built, brand-matched card: branding on
 * the left, and a hero illustration on the right showing an encrypted message
 * (ciphertext) being hidden inside an image behind a padlock.
 *
 * Usage: node scripts/generate-og-image.mjs
 */
import { writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { chromium } from '@playwright/test';

const ROOT = new URL('..', import.meta.url).pathname;
const OUT = join(ROOT, 'src/assets/og_image.png');

const BACKGROUND = '#30404d';
const BACKDROP = '#182026';
const CARD = '#394b59';
const FOREGROUND = '#f5f8fa';
const LOCK_PATH =
  'M400 256H152V152.9c0-39.6 31.7-72.5 71.3-72.9 40-.4 72.7 32.1 72.7 72v16c0 13.3 10.7 24 24 24h32c13.3 0 24-10.7 24-24v-16C376 68 307.5-.3 223.5 0 139.5.3 72 69.5 72 153.5V256H48c-26.5 0-48 21.5-48 48v160c0 26.5 21.5 48 48 48h352c26.5 0 48-21.5 48-48V304c0-26.5-21.5-48-48-48zM264 408c0 22.1-17.9 40-40 40s-40-17.9-40-40v-48c0-22.1 17.9-40 40-40s40 17.9 40 40v48z';

// Deterministic pseudo-random hex so the "ciphertext" looks real but stable.
function cipherText(chars) {
  const hex = '0123456789abcdef';
  let out = '';
  let seed = 0x9e3779b9;
  for (let i = 0; i < chars; i += 1) {
    seed = (seed * 1664525 + 1013904223) >>> 0;
    out += hex[(seed >>> 8) & 0xf];
    if (i % 2 === 1 && i % 24 !== 23) out += ' ';
    if (i % 24 === 23) out += '\n';
  }
  return out;
}

function cardHtml() {
  return `<!doctype html><html><head><meta charset="utf-8"><style>
    * { margin: 0; box-sizing: border-box; }
    body {
      width: 1200px; height: 630px; overflow: hidden;
      font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
      color: ${FOREGROUND};
      background:
        radial-gradient(1100px 700px at 80% -10%, rgba(37,117,252,0.30), transparent 60%),
        radial-gradient(900px 700px at -10% 120%, rgba(106,17,203,0.24), transparent 55%),
        linear-gradient(135deg, ${BACKGROUND} 0%, ${BACKDROP} 100%);
    }
    .stage { display: flex; align-items: center; height: 100%; padding: 0 70px; gap: 36px; }
    .left { width: 48%; flex-shrink: 0; }
    .brand { display: flex; align-items: center; gap: 18px; margin-bottom: 28px; }
    .mark {
      width: 74px; height: 74px; border-radius: 18px; background: ${CARD};
      display: flex; align-items: center; justify-content: center;
      box-shadow: 0 10px 30px rgba(0,0,0,0.35), inset 0 1px 0 rgba(255,255,255,0.06);
    }
    .wordmark { font-size: 40px; font-weight: 700; letter-spacing: -0.5px; }
    h1 { font-size: 60px; line-height: 1.04; font-weight: 800; letter-spacing: -1.5px; }
    h1 .accent {
      background: linear-gradient(90deg, #8ab4ff, #b98bff);
      -webkit-background-clip: text; background-clip: text; color: transparent;
    }
    p.tag { margin-top: 22px; font-size: 23px; line-height: 1.5; color: rgba(245,248,250,0.72); max-width: 480px; }
    .chips { display: flex; flex-wrap: wrap; gap: 12px; margin-top: 34px; }
    .chip {
      font-size: 18px; font-weight: 600; padding: 10px 18px; border-radius: 999px;
      background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.12);
      color: rgba(245,248,250,0.9);
    }
    .url { margin-top: 40px; font-size: 18px; color: rgba(245,248,250,0.5); letter-spacing: 0.3px; }

    .right { flex: 1; display: flex; align-items: center; justify-content: center; }
    .art { position: relative; transform: perspective(1600px) rotateY(-11deg) rotateX(3deg); }
    .photo {
      width: 430px; height: 340px; border-radius: 22px; position: relative; overflow: hidden;
      background: linear-gradient(135deg, #ff7e5f 0%, #feb47b 28%, #6a11cb 72%, #2575fc 100%);
      box-shadow: 0 40px 90px rgba(0,0,0,0.55), inset 0 0 0 1px rgba(255,255,255,0.14);
    }
    /* Encrypted payload woven into the lower pixels of the image. */
    .cipher {
      position: absolute; inset: 0; padding: 20px; display: flex; align-items: flex-end;
      font-family: 'SFMono-Regular', Menlo, Consolas, monospace;
      font-size: 15px; line-height: 1.5; letter-spacing: 1px;
      color: rgba(255,255,255,0.92); white-space: pre; word-break: break-all;
      text-shadow: 0 1px 2px rgba(0,0,0,0.4);
      -webkit-mask-image: linear-gradient(to top, #000 8%, transparent 62%);
      mask-image: linear-gradient(to top, #000 8%, transparent 62%);
      mix-blend-mode: overlay;
    }
    /* Faint pixel grid to signal per-pixel LSB embedding. */
    .grid {
      position: absolute; inset: 0;
      background-image:
        linear-gradient(rgba(255,255,255,0.09) 1px, transparent 1px),
        linear-gradient(90deg, rgba(255,255,255,0.09) 1px, transparent 1px);
      background-size: 26px 26px;
      -webkit-mask-image: linear-gradient(135deg, transparent 45%, #000 100%);
      mask-image: linear-gradient(135deg, transparent 45%, #000 100%);
    }
    .badge {
      position: absolute; right: -34px; bottom: -30px;
      width: 118px; height: 118px; border-radius: 30px;
      background: rgba(24,32,38,0.55); backdrop-filter: blur(6px);
      border: 1px solid rgba(255,255,255,0.22);
      display: flex; align-items: center; justify-content: center;
      box-shadow: 0 24px 50px rgba(0,0,0,0.5);
    }
  </style></head><body>
    <div class="stage">
      <div class="left">
        <div class="brand">
          <div class="mark">
            <svg width="40" height="40" viewBox="0 0 448 512"><path fill="${FOREGROUND}" d="${LOCK_PATH}"/></svg>
          </div>
          <span class="wordmark">Digi-Cloak</span>
        </div>
        <h1>Hide secrets<br>in <span class="accent">plain sight</span>.</h1>
        <p class="tag">Encrypt a message and hide it inside an image — right in your browser.</p>
        <div class="chips">
          <span class="chip">AES-256 encryption</span>
          <span class="chip">LSB steganography</span>
          <span class="chip">100% private</span>
        </div>
        <div class="url">kaushalmeena.github.io/digi-cloak</div>
      </div>
      <div class="right">
        <div class="art">
          <div class="photo">
            <div class="grid"></div>
            <div class="cipher">${cipherText(120)}</div>
          </div>
          <div class="badge">
            <svg width="58" height="58" viewBox="0 0 448 512"><path fill="${FOREGROUND}" d="${LOCK_PATH}"/></svg>
          </div>
        </div>
      </div>
    </div>
  </body></html>`;
}

const browser = await chromium.launch();
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
