import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideNoopAnimations } from '@angular/platform-browser/animations';

import { getEncodedBase64Image } from '../../utils/stegano';
import { Unlock } from './unlock';

function createTestImage(size = 50): string {
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const context = canvas.getContext('2d') as CanvasRenderingContext2D;
  context.fillStyle = '#336699';
  context.fillRect(0, 0, size, size);
  return canvas.toDataURL('image/png');
}

function dataUrlToFile(dataUrl: string, name: string, type: string): File {
  const base64 = dataUrl.split(',')[1];
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) {
    bytes[i] = binary.charCodeAt(i);
  }
  return new File([bytes], name, { type });
}

function setInputFile(input: HTMLInputElement, file: File): void {
  const dataTransfer = new DataTransfer();
  dataTransfer.items.add(file);
  input.files = dataTransfer.files;
  input.dispatchEvent(new Event('change'));
}

async function flush(fixture: ComponentFixture<unknown>): Promise<void> {
  await new Promise((resolve) => setTimeout(resolve, 50));
  fixture.detectChanges();
}

describe('Unlock', () => {
  let fixture: ComponentFixture<Unlock>;
  let element: HTMLElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Unlock],
      providers: [provideNoopAnimations()],
    }).compileComponents();

    fixture = TestBed.createComponent(Unlock);
    element = fixture.nativeElement;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('shows a preview once an image file is chosen', async () => {
    const encoded = await getEncodedBase64Image(
      createTestImage(),
      'top secret',
      'hunter2'
    );
    const input = element.querySelector<HTMLInputElement>('#image')!;
    setInputFile(input, dataUrlToFile(encoded, 'encoded.png', 'image/png'));
    await flush(fixture);

    const img = element.querySelector<HTMLImageElement>(
      'img[alt="Preview-Image"]'
    );
    expect(img?.src).toMatch(/^data:image\/png;base64,/);
  });

  it('decodes a message hidden with the right password', async () => {
    const encoded = await getEncodedBase64Image(
      createTestImage(),
      'top secret',
      'hunter2'
    );
    const input = element.querySelector<HTMLInputElement>('#image')!;
    setInputFile(input, dataUrlToFile(encoded, 'encoded.png', 'image/png'));
    await flush(fixture);

    element.querySelector<HTMLInputElement>('#password')!.value = 'hunter2';
    const form = element.querySelector('form')!;
    form.dispatchEvent(new Event('submit', { cancelable: true }));
    await flush(fixture);

    const messageEl = element.querySelector<HTMLTextAreaElement>('#message')!;
    expect(messageEl.value).toBe('top secret');

    const copyButton = element.querySelector<HTMLButtonElement>(
      '.button-container button[type="button"]'
    )!;
    expect(copyButton.disabled).toBeFalse();
  });

  it('shows an error in the snackbar for the wrong password', async () => {
    const encoded = await getEncodedBase64Image(
      createTestImage(),
      'top secret',
      'hunter2'
    );
    const input = element.querySelector<HTMLInputElement>('#image')!;
    setInputFile(input, dataUrlToFile(encoded, 'encoded.png', 'image/png'));
    await flush(fixture);

    element.querySelector<HTMLInputElement>('#password')!.value = 'wrong';
    const form = element.querySelector('form')!;
    form.dispatchEvent(new Event('submit', { cancelable: true }));
    await flush(fixture);

    expect(element.querySelector('.snackbar')?.textContent).toContain(
      'Password is incorrect'
    );
    const messageEl = element.querySelector<HTMLTextAreaElement>('#message')!;
    expect(messageEl.value).toBe('');
  });

  it('copies the decoded message and notifies via the snackbar', async () => {
    spyOn(navigator.clipboard, 'writeText').and.resolveTo();

    const encoded = await getEncodedBase64Image(
      createTestImage(),
      'top secret',
      'hunter2'
    );
    const input = element.querySelector<HTMLInputElement>('#image')!;
    setInputFile(input, dataUrlToFile(encoded, 'encoded.png', 'image/png'));
    await flush(fixture);

    element.querySelector<HTMLInputElement>('#password')!.value = 'hunter2';
    const form = element.querySelector('form')!;
    form.dispatchEvent(new Event('submit', { cancelable: true }));
    await flush(fixture);

    const copyButton = element.querySelector<HTMLButtonElement>(
      '.button-container button[type="button"]'
    )!;
    copyButton.click();
    await flush(fixture);

    expect(navigator.clipboard.writeText).toHaveBeenCalledWith('top secret');
    expect(element.querySelector('.snackbar')?.textContent).toContain(
      'Copied to clipboard'
    );
  });

  it('shows an error in the snackbar when copying fails', async () => {
    spyOn(navigator.clipboard, 'writeText').and.rejectWith(
      new Error('Clipboard unavailable')
    );

    const encoded = await getEncodedBase64Image(
      createTestImage(),
      'top secret',
      'hunter2'
    );
    const input = element.querySelector<HTMLInputElement>('#image')!;
    setInputFile(input, dataUrlToFile(encoded, 'encoded.png', 'image/png'));
    await flush(fixture);

    element.querySelector<HTMLInputElement>('#password')!.value = 'hunter2';
    const form = element.querySelector('form')!;
    form.dispatchEvent(new Event('submit', { cancelable: true }));
    await flush(fixture);

    const copyButton = element.querySelector<HTMLButtonElement>(
      '.button-container button[type="button"]'
    )!;
    copyButton.click();
    await flush(fixture);

    expect(element.querySelector('.snackbar')?.textContent).toContain(
      'Clipboard unavailable'
    );
  });
});
