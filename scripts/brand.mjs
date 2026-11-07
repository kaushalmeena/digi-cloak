/**
 * Shared brand pieces for the asset scripts: the mark (a keyhole padlock in
 * the same stroke style as the UI's icons, on an ink tile) and a browser
 * launcher. The mark is neutral on purpose: the app's accent colour rotates
 * per visit, so icons must work beside any of them.
 */
import { chromium } from '@playwright/test';

export const INK = '#16191b';
export const PAPER = '#f6f7f7';

/** Lucide "lock-keyhole" geometry (ISC licence), 24x24 viewBox. */
const LOCK = `
  <circle cx="12" cy="16" r="1" />
  <rect width="18" height="12" x="3" y="10" rx="2" />
  <path d="M7 10V7a5 5 0 0 1 10 0v3" />`;

/**
 * The mark as an SVG string.
 * @param {object} options
 * @param {number} options.size  rendered size in px
 * @param {number} [options.glyph] share of the tile the lock fills (0-1)
 * @param {number} [options.radius] tile corner radius as a share of size
 */
export function markSvg({ size, glyph = 0.56, radius = 0.22 }) {
  const round = (n) => Math.round(n * 100) / 100;
  const inset = round((24 / glyph - 24) / 2);
  const box = round(24 + inset * 2);
  return `<svg xmlns="http://www.w3.org/2000/svg" style="display:block" width="${size}" height="${size}" viewBox="${-inset} ${-inset} ${box} ${box}">
  <rect x="${-inset}" y="${-inset}" width="${box}" height="${box}" rx="${round(box * radius)}" fill="${INK}" />
  <g fill="none" stroke="#ffffff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${LOCK}</g>
</svg>`;
}

/** Playwright's bundled Chromium, or the installed Chrome when it's missing. */
export async function launchBrowser() {
  try {
    return await chromium.launch();
  } catch {
    return chromium.launch({ channel: 'chrome' });
  }
}
