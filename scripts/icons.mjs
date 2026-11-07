/**
 * Regenerates the favicon and public/icons/icon-*.png from the brand mark.
 * Usage: node scripts/icons.mjs
 */
import { mkdir, writeFile } from 'node:fs/promises';

import { INK, launchBrowser, markSvg } from './brand.mjs';

const SIZES = [72, 96, 128, 144, 152, 192, 384, 512];

function iconHtml(size) {
  // Full-bleed ink tile with the glyph inside the maskable safe zone (~80%),
  // so platforms can crop it to a circle or squircle without clipping.
  return `<!doctype html><body style="margin:0;background:${INK}">
    ${markSvg({ size, glyph: 0.46, radius: 0 })}
  </body>`;
}

await writeFile('public/favicon.svg', `${markSvg({ size: 32 })}\n`);
console.log('favicon.svg');

await mkdir('public/icons', { recursive: true });
// Shrinking one reused page's viewport to small sizes made headless Chrome
// paint stale, tiled slices into the capture. Each render gets a fresh page at
// a fixed viewport larger than any icon; the screenshot crops to the icon.
const VIEWPORT = { width: 512, height: 512 };

const browser = await launchBrowser();
try {
  for (const size of SIZES) {
    const page = await browser.newPage({ viewport: VIEWPORT });
    await page.setContent(iconHtml(size), { waitUntil: 'load' });
    await page.screenshot({
      path: `public/icons/icon-${size}x${size}.png`,
      clip: { x: 0, y: 0, width: size, height: size },
    });
    await page.close();
    console.log(`icon-${size}x${size}.png`);
  }

  // favicon.ico for browsers without SVG favicons: one 32px PNG wrapped in an
  // ICO container (ICO allows PNG payloads), so no extra tooling is needed.
  const page = await browser.newPage({ viewport: VIEWPORT });
  await page.setContent(
    `<!doctype html><body style="margin:0">${markSvg({ size: 32 })}</body>`,
    { waitUntil: 'load' },
  );
  const png = await page.screenshot({
    clip: { x: 0, y: 0, width: 32, height: 32 },
    omitBackground: true,
  });
  const header = Buffer.alloc(22);
  header.writeUInt16LE(0, 0); // reserved
  header.writeUInt16LE(1, 2); // type: icon
  header.writeUInt16LE(1, 4); // image count
  header.writeUInt8(32, 6); // width
  header.writeUInt8(32, 7); // height
  header.writeUInt16LE(1, 10); // colour planes
  header.writeUInt16LE(32, 12); // bits per pixel
  header.writeUInt32LE(png.length, 14); // payload size
  header.writeUInt32LE(22, 18); // payload offset
  await writeFile('src/favicon.ico', Buffer.concat([header, png]));
  console.log('favicon.ico');
} finally {
  await browser.close();
}
