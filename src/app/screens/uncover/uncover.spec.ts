import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import {
  createTestImage,
  dataUrlToFile,
  setInputFile,
  waitFor,
} from '../../testing/fixtures';
import { getEncodedBase64Image } from '../../utils/stegano';
import { describeDecodeError, Uncover } from './uncover';

async function createEncodedImageFile(
  message: string,
  password: string,
): Promise<File> {
  const encoded = await getEncodedBase64Image(
    createTestImage(),
    message,
    password,
  );
  return dataUrlToFile(encoded, 'encoded.png', 'image/png');
}

describe('Uncover', () => {
  let fixture: ComponentFixture<Uncover>;
  let element: HTMLElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Uncover],
      providers: [provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(Uncover);
    element = fixture.nativeElement;
    fixture.detectChanges();
  });

  async function loadEncodedImage(password: string): Promise<void> {
    const file = await createEncodedImageFile('top secret', 'hunter2');
    const input = element.querySelector<HTMLInputElement>('#image')!;
    setInputFile(input, file);
    await waitFor(fixture, () =>
      element.querySelector('img[alt="Selected image"]'),
    );

    element.querySelector<HTMLInputElement>('#password')!.value = password;
    element
      .querySelector('form')!
      .dispatchEvent(new Event('submit', { cancelable: true }));
  }

  it('should create', () => {
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('decodes a message hidden with the right password', async () => {
    await loadEncodedImage('hunter2');
    await waitFor(
      fixture,
      () => element.querySelector<HTMLTextAreaElement>('#message')?.value,
    );

    expect(element.querySelector<HTMLTextAreaElement>('#message')?.value).toBe(
      'top secret',
    );

    const copyButton = element.querySelector<HTMLButtonElement>(
      '[data-testid="copy-button"]',
    )!;
    expect(copyButton.disabled).toBeFalse();
  });

  it('shows an inline error for the wrong password', async () => {
    await loadEncodedImage('wrong');
    await waitFor(fixture, () =>
      element.querySelector('[data-testid="error"]')?.textContent?.trim(),
    );

    expect(
      element.querySelector('[data-testid="error"]')?.textContent,
    ).toContain('Password is incorrect');
    expect(element.querySelector('[data-testid="result"]')).toBeNull();
  });

  it('explains when the image holds no message', () => {
    expect(describeDecodeError('Message not found in the image')).toContain(
      'No hidden message found',
    );
  });

  it('copies the decoded message and confirms on the button', async () => {
    spyOn(navigator.clipboard, 'writeText').and.resolveTo();
    await loadEncodedImage('hunter2');
    await waitFor(
      fixture,
      () => element.querySelector<HTMLTextAreaElement>('#message')?.value,
    );

    element
      .querySelector<HTMLButtonElement>('[data-testid="copy-button"]')!
      .click();
    const copyButton = (): HTMLButtonElement =>
      element.querySelector<HTMLButtonElement>('[data-testid="copy-button"]')!;
    await waitFor(fixture, () => copyButton().textContent?.includes('Copied'));

    expect(navigator.clipboard.writeText).toHaveBeenCalledWith('top secret');
    expect(
      element.querySelector('[data-testid="copy-error"]')?.textContent?.trim(),
    ).toBe('');
  });

  it('shows an inline error when copying fails', async () => {
    spyOn(navigator.clipboard, 'writeText').and.rejectWith(
      new Error('Clipboard unavailable'),
    );
    await loadEncodedImage('hunter2');
    await waitFor(
      fixture,
      () => element.querySelector<HTMLTextAreaElement>('#message')?.value,
    );

    element
      .querySelector<HTMLButtonElement>('[data-testid="copy-button"]')!
      .click();
    await waitFor(fixture, () =>
      element.querySelector('[data-testid="copy-error"]')?.textContent?.trim(),
    );

    expect(
      element.querySelector('[data-testid="copy-error"]')?.textContent,
    ).toContain('Clipboard unavailable');
  });

  it('warns early when the image holds no message', async () => {
    const input = element.querySelector<HTMLInputElement>('#image')!;
    setInputFile(
      input,
      dataUrlToFile(createTestImage(), 'plain.png', 'image/png'),
    );
    await waitFor(
      fixture,
      () =>
        element.querySelector<HTMLElement>(
          'app-collapse:has([data-testid="no-message"])',
        )?.style.gridTemplateRows === '1fr',
    );
  });
});
