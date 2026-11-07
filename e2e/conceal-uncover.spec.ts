import { expect, test } from '@playwright/test';

import { createTestPng } from './test-png';

const SECRET = 'e2e secret message';
const PASSWORD = 'correct horse battery';

test('conceals a message in an image and uncovers it again', async ({ page }) => {
  await page.goto('/#/conceal');

  await page.fill('#message', SECRET);
  await page.setInputFiles('#image', {
    name: 'photo.png',
    mimeType: 'image/png',
    buffer: createTestPng(),
  });
  await expect(page.locator('img[alt="Selected image"]')).toBeVisible();
  await page.fill('#password', PASSWORD);
  await page.getByRole('button', { name: 'Conceal message' }).click();

  await expect(page.getByTestId('encoded-image')).toBeVisible({
    timeout: 30_000,
  });

  const downloadPromise = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Download PNG' }).click();
  const download = await downloadPromise;
  expect(download.suggestedFilename()).toBe('digicloak-photo.png');
  const encodedPath = test.info().outputPath('encoded.png');
  await download.saveAs(encodedPath);

  await page.getByRole('link', { name: 'Uncover' }).click();
  await expect(page.getByRole('button', { name: 'Uncover message' })).toBeVisible();
  await page.setInputFiles('#image', encodedPath);
  await expect(page.locator('img[alt="Selected image"]')).toBeVisible();
  await page.fill('#password', PASSWORD);
  await page.getByRole('button', { name: 'Uncover message' }).click();

  await expect(page.locator('#message')).toHaveValue(SECRET, {
    timeout: 30_000,
  });
});

test('shows an error for a wrong password', async ({ page }) => {
  await page.goto('/#/conceal');
  await page.fill('#message', SECRET);
  await page.setInputFiles('#image', {
    name: 'photo.png',
    mimeType: 'image/png',
    buffer: createTestPng(),
  });
  await expect(page.locator('img[alt="Selected image"]')).toBeVisible();
  await page.fill('#password', PASSWORD);
  await page.getByRole('button', { name: 'Conceal message' }).click();

  const downloadPromise = page.waitForEvent('download');
  await expect(page.getByTestId('encoded-image')).toBeVisible({
    timeout: 30_000,
  });
  await page.getByRole('button', { name: 'Download PNG' }).click();
  const encodedPath = test.info().outputPath('encoded-wrong.png');
  await (await downloadPromise).saveAs(encodedPath);

  await page.getByRole('link', { name: 'Uncover' }).click();
  await expect(page.getByRole('button', { name: 'Uncover message' })).toBeVisible();
  await page.setInputFiles('#image', encodedPath);
  await expect(page.locator('img[alt="Selected image"]')).toBeVisible();
  await page.fill('#password', 'not the password');
  await page.getByRole('button', { name: 'Uncover message' }).click();

  await expect(page.getByTestId('error')).toContainText(
    'Password is incorrect',
    { timeout: 30_000 },
  );
});
