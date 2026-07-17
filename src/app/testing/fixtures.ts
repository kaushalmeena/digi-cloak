import { ComponentFixture } from '@angular/core/testing';

export function createTestImage(size = 50): string {
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const context = canvas.getContext('2d') as CanvasRenderingContext2D;
  context.fillStyle = '#336699';
  context.fillRect(0, 0, size, size);
  return canvas.toDataURL('image/png');
}

export function dataUrlToFile(
  dataUrl: string,
  name: string,
  type: string
): File {
  const base64 = dataUrl.split(',')[1];
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) {
    bytes[i] = binary.charCodeAt(i);
  }
  return new File([bytes], name, { type });
}

export function createTestImageFile(): File {
  return dataUrlToFile(createTestImage(), 'test.png', 'image/png');
}

export function setInputFile(
  input: HTMLInputElement,
  file: File | null
): void {
  const dataTransfer = new DataTransfer();
  if (file) {
    dataTransfer.items.add(file);
  }
  input.files = dataTransfer.files;
  input.dispatchEvent(new Event('change'));
}

export async function flush(fixture: ComponentFixture<unknown>): Promise<void> {
  await new Promise((resolve) => setTimeout(resolve, 50));
  fixture.detectChanges();
}

/** Polls until `predicate` is truthy, running change detection between polls. */
export async function waitFor(
  fixture: ComponentFixture<unknown>,
  predicate: () => unknown,
  timeoutMs = 8000
): Promise<void> {
  const start = Date.now();
  fixture.detectChanges();
  while (!predicate()) {
    if (Date.now() - start > timeoutMs) {
      throw new Error('waitFor timed out');
    }
    await new Promise((resolve) => setTimeout(resolve, 25));
    fixture.detectChanges();
  }
}
