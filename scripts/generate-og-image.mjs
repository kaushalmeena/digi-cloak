/**
 * Regenerates src/assets/og_image.png (1200x630 social share card).
 *
 * Plain copy on the left; on the right, the product itself: the result panel
 * as the app shows it after a message is hidden. Colours match the app's
 * light theme and its default teal accent.
 *
 * Usage: node scripts/generate-og-image.mjs
 */
import { writeFile } from 'node:fs/promises';
import { join } from 'node:path';

import { INK, PAPER, launchBrowser, markSvg } from './brand.mjs';

const ROOT = new URL('..', import.meta.url).pathname;
const OUT = join(ROOT, 'src/assets/og_image.png');

const ACCENT = '#0e7468';
const MUTED = '#5d666b';
const BORDER = '#e1e5e6';
const SUCCESS = '#1d7a4a';
const SUCCESS_SOFT = '#e5f3eb';
const CHECKER = '#e9ecec';

const ICON = (paths, size = 18, color = 'currentColor') =>
  `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${paths}</svg>`;
const CHECK = '<path d="M20 6 9 17l-5-5"/>';
const DOWNLOAD =
  '<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><path d="m7 10 5 5 5-5"/><path d="M12 15V3"/>';
const SPLIT =
  '<rect width="18" height="18" x="3" y="3" rx="2"/><path d="M12 3v18"/>';
const SHIELD =
  '<path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"/><path d="m9 12 2 2 4-4"/>';

function cardHtml() {
  return `<!doctype html><html><head><meta charset="utf-8"><style>
    * { margin: 0; box-sizing: border-box; }
    body {
      width: 1200px; height: 630px; overflow: hidden; background: ${PAPER};
      color: ${INK};
      font-family: ui-sans-serif, system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      -webkit-font-smoothing: antialiased;
    }
    .stage { display: grid; grid-template-columns: 1fr 460px; gap: 56px; align-items: center; height: 100%; padding: 0 80px; }
    .brand { display: flex; align-items: center; gap: 14px; font-size: 28px; font-weight: 650; letter-spacing: -0.4px; }
    h1 { margin-top: 44px; font-size: 64px; line-height: 1.04; font-weight: 700; letter-spacing: -2px; }
    p.tag { margin-top: 22px; font-size: 24px; line-height: 1.45; color: ${MUTED}; max-width: 520px; }
    .facts { display: flex; gap: 10px; margin-top: 36px; }
    .fact { display: flex; align-items: center; white-space: nowrap; gap: 8px; font-size: 17px; font-weight: 550; padding: 9px 14px; border: 1px solid ${BORDER}; border-radius: 999px; background: #fff; }
    .fact svg { color: ${ACCENT}; }

    .panel { background: #fff; border: 1px solid ${BORDER}; border-radius: 18px; overflow: hidden; box-shadow: 0 30px 60px rgb(16 22 26 / 0.10), 0 2px 4px rgb(16 22 26 / 0.04); }
    .head { display: flex; align-items: center; gap: 12px; padding: 16px 20px; border-bottom: 1px solid ${BORDER}; font-size: 19px; font-weight: 650; }
    .ok { width: 30px; height: 30px; border-radius: 999px; display: grid; place-items: center; background: ${SUCCESS_SOFT}; color: ${SUCCESS}; }
    .file { margin-left: auto; font-size: 15px; font-weight: 450; color: ${MUTED}; }
    .stagearea { height: 270px; display: grid; place-items: center; background-color: #fff;
      background-image: conic-gradient(${CHECKER} 25%, transparent 0 50%, ${CHECKER} 0 75%, transparent 0); background-size: 20px 20px; }
    .photo { width: 330px; height: 214px; border-radius: 6px; background:
      radial-gradient(120px 90px at 72% 30%, #fde3b0, transparent 70%),
      linear-gradient(180deg, #8fc3d9 0%, #c9e2e8 52%, #6f9a74 53%, #4f7a57 100%); }
    .foot { display: flex; gap: 12px; padding: 18px 20px; border-top: 1px solid ${BORDER}; }
    .btn { display: flex; align-items: center; justify-content: center; gap: 10px; height: 50px; border-radius: 10px; font-size: 18px; font-weight: 600; }
    .secondary { padding: 0 20px; border: 1px solid #d3d9da; }
    .primary { flex: 1; background: ${ACCENT}; color: #fff; }
  </style></head><body>
    <div class="stage">
      <div>
        <div class="brand">${markSvg({ size: 48 })}Digi-Cloak</div>
        <h1>Hide a message<br>inside an image</h1>
        <p class="tag">Encrypt text with a password and write it into a picture's pixels. Free, and it runs in your browser.</p>
        <div class="facts">
          <span class="fact">${ICON(SHIELD)}Nothing uploaded</span>
          <span class="fact">AES-256-GCM</span>
          <span class="fact">LSB steganography</span>
        </div>
      </div>
      <div class="panel">
        <div class="head"><span class="ok">${ICON(CHECK, 16)}</span>Message hidden<span class="file">digicloak-lake.png</span></div>
        <div class="stagearea"><div class="photo"></div></div>
        <div class="foot">
          <span class="btn secondary">${ICON(SPLIT)}Compare</span>
          <span class="btn primary">${ICON(DOWNLOAD)}Download PNG</span>
        </div>
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
