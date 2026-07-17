/**
 * Regenerates public/icons/icon-*.png from the Digi-Cloak padlock SVG.
 * Usage: node scripts/generate-icons.mjs
 */
import { mkdir } from 'node:fs/promises';
import { chromium } from '@playwright/test';

const SIZES = [72, 96, 128, 144, 152, 192, 384, 512];
const BACKGROUND = '#394b59';
const FOREGROUND = '#f5f8fa';
const LOCK_PATH =
  'M400 256H152V152.9c0-39.6 31.7-72.5 71.3-72.9 40-.4 72.7 32.1 72.7 72v16c0 13.3 10.7 24 24 24h32c13.3 0 24-10.7 24-24v-16C376 68 307.5-.3 223.5 0 139.5.3 72 69.5 72 153.5V256H48c-26.5 0-48 21.5-48 48v160c0 26.5 21.5 48 48 48h352c26.5 0 48-21.5 48-48V304c0-26.5-21.5-48-48-48zM264 408c0 22.1-17.9 40-40 40s-40-17.9-40-40v-48c0-22.1 17.9-40 40-40s40 17.9 40 40v48z';

function iconHtml(size) {
  // Keep the glyph inside the maskable safe zone (~80% of the icon).
  return `<!doctype html><body style="margin:0">
    <div style="width:${size}px;height:${size}px;background:${BACKGROUND};display:flex;align-items:center;justify-content:center">
      <svg width="55%" height="55%" viewBox="0 0 448 512" xmlns="http://www.w3.org/2000/svg">
        <path fill="${FOREGROUND}" d="${LOCK_PATH}"/>
      </svg>
    </div>
  </body>`;
}

await mkdir('public/icons', { recursive: true });

const browser = await chromium.launch();
const page = await browser.newPage();

for (const size of SIZES) {
  await page.setViewportSize({ width: size, height: size });
  await page.setContent(iconHtml(size));
  await page.screenshot({
    path: `public/icons/icon-${size}x${size}.png`,
    clip: { x: 0, y: 0, width: size, height: size },
  });
  console.log(`icon-${size}x${size}.png`);
}

await browser.close();
