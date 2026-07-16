import { ComponentFixture, TestBed } from '@angular/core/testing';

import {
  createTestImage,
  dataUrlToFile,
  flush,
  setInputFile,
} from '../../testing/fixtures';
import { getEncodedBase64Image } from '../../utils/stegano';
import { Unlock } from './unlock';

async function createEncodedImageFile(
  message: string,
  password: string
): Promise<File> {
  const encoded = await getEncodedBase64Image(
    createTestImage(),
    message,
    password
  );
  return dataUrlToFile(encoded, 'encoded.png', 'image/png');
}

describe('Unlock', () => {
  let fixture: ComponentFixture<Unlock>;
  let element: HTMLElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Unlock],
    }).compileComponents();

    fixture = TestBed.createComponent(Unlock);
    element = fixture.nativeElement;
    fixture.detectChanges();
  });

  async function loadEncodedImage(password: string): Promise<void> {
    const file = await createEncodedImageFile('top secret', 'hunter2');
    const input = element.querySelector<HTMLInputElement>('#image')!;
    setInputFile(input, file);
    await flush(fixture);

    element.querySelector<HTMLInputElement>('#password')!.value = password;
    const form = element.querySelector('form')!;
    form.dispatchEvent(new Event('submit', { cancelable: true }));
    await flush(fixture);
  }

  it('should create', () => {
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('shows a preview once an image file is chosen', async () => {
    const file = await createEncodedImageFile('top secret', 'hunter2');
    const input = element.querySelector<HTMLInputElement>('#image')!;
    setInputFile(input, file);
    await flush(fixture);

    const img = element.querySelector<HTMLImageElement>(
      'img[alt="Preview-Image"]'
    );
    expect(img?.src).toMatch(/^data:image\/png;base64,/);
  });

  it('decodes a message hidden with the right password', async () => {
    await loadEncodedImage('hunter2');

    const messageEl = element.querySelector<HTMLTextAreaElement>('#message')!;
    expect(messageEl.value).toBe('top secret');

    const copyButton = element.querySelector<HTMLButtonElement>(
      '.button-container button[type="button"]'
    )!;
    expect(copyButton.disabled).toBeFalse();
  });

  it('shows an error in the snackbar for the wrong password', async () => {
    await loadEncodedImage('wrong');

    expect(element.querySelector('.snackbar')?.textContent).toContain(
      'Password is incorrect'
    );
    const messageEl = element.querySelector<HTMLTextAreaElement>('#message')!;
    expect(messageEl.value).toBe('');
  });

  it('copies the decoded message and notifies via the snackbar', async () => {
    spyOn(navigator.clipboard, 'writeText').and.resolveTo();
    await loadEncodedImage('hunter2');

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
    await loadEncodedImage('hunter2');

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
