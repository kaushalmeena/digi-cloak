import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import {
  createTestImage,
  createTestImageFile,
  dataUrlToFile,
  setInputFile,
  waitFor,
} from '../../testing/fixtures';
import { getDecodedMessage, getEncodedBase64Image } from '../../utils/stegano';
import { Lock } from './lock';

describe('Lock', () => {
  let fixture: ComponentFixture<Lock>;
  let element: HTMLElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Lock],
      providers: [provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(Lock);
    element = fixture.nativeElement;
    fixture.detectChanges();
  });

  async function chooseImage(): Promise<void> {
    const input = element.querySelector<HTMLInputElement>('#image')!;
    setInputFile(input, createTestImageFile());
    await waitFor(fixture, () =>
      element.querySelector('img[alt="Selected image"]'),
    );
  }

  function submit(message: string, password: string): void {
    element.querySelector<HTMLTextAreaElement>('#message')!.value = message;
    element.querySelector<HTMLInputElement>('#password')!.value = password;
    element
      .querySelector('form')!
      .dispatchEvent(new Event('submit', { cancelable: true }));
  }

  it('should create', () => {
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('shows a preview and the capacity meter once an image file is chosen', async () => {
    await chooseImage();

    const img = element.querySelector<HTMLImageElement>(
      'img[alt="Selected image"]',
    );
    expect(img?.src).toMatch(/^data:image\/png;base64,/);

    await waitFor(fixture, () =>
      element.querySelector('[data-testid="capacity-meter"]'),
    );
    expect(
      element.querySelector('[data-testid="capacity-meter"]')?.textContent,
    ).toContain('/ ~');
  });

  it('clears the preview when the file selection is removed', async () => {
    await chooseImage();

    const input = element.querySelector<HTMLInputElement>('#image')!;
    setInputFile(input, null);
    fixture.detectChanges();
    expect(element.querySelector('img[alt="Selected image"]')).toBeNull();
  });

  it('encodes the message into the image on submit', async () => {
    await chooseImage();
    submit('top secret', 'hunter2');
    await waitFor(fixture, () =>
      element.querySelector('[data-testid="encoded-image"]'),
    );

    const outputImg = element.querySelector<HTMLImageElement>(
      '[data-testid="encoded-image"]',
    )!;
    expect(outputImg.src).toMatch(/^data:image\/png;base64,/);

    const saveButton = element.querySelector<HTMLButtonElement>(
      '[data-testid="save-button"]',
    )!;
    expect(saveButton.disabled).toBeFalse();

    const decoded = await getDecodedMessage(outputImg.src, 'hunter2');
    expect(decoded).toBe('top secret');
  });

  it('opens the comparison modal once encoded', async () => {
    await chooseImage();
    submit('top secret', 'hunter2');
    await waitFor(
      fixture,
      () =>
        !element.querySelector<HTMLButtonElement>(
          '[data-testid="compare-button"]',
        )!.disabled,
    );

    element
      .querySelector<HTMLButtonElement>('[data-testid="compare-button"]')!
      .click();
    fixture.detectChanges();

    const dialog = element.querySelector<HTMLDialogElement>('dialog')!;
    expect(dialog.open).toBeTrue();
    expect(
      dialog.querySelector('app-compare img[alt="Encoded image"]'),
    ).not.toBeNull();
  });

  it('shows an inline error when no image is chosen', async () => {
    submit('top secret', 'hunter2');
    await waitFor(fixture, () =>
      element.querySelector('[data-testid="error"]')?.textContent?.trim(),
    );

    expect(
      element.querySelector('[data-testid="error"]')?.textContent,
    ).toContain('Choose an image');
  });

  it('clears a finished result when the message is edited', async () => {
    await chooseImage();
    submit('top secret', 'hunter2');
    await waitFor(fixture, () =>
      element.querySelector('[data-testid="encoded-image"]'),
    );

    const message = element.querySelector<HTMLTextAreaElement>('#message')!;
    message.value = 'top secret, edited';
    message.dispatchEvent(new Event('input'));
    fixture.detectChanges();

    expect(element.querySelector('[data-testid="encoded-image"]')).toBeNull();
    expect(
      element.querySelector<HTMLButtonElement>('[data-testid="save-button"]')!
        .disabled,
    ).toBeTrue();
  });

  it('triggers a download with a digicloak filename when Save is clicked', async () => {
    const clickSpy = spyOn(HTMLAnchorElement.prototype, 'click');

    await chooseImage();
    submit('top secret', 'hunter2');
    await waitFor(fixture, () =>
      element.querySelector('[data-testid="encoded-image"]'),
    );

    const saveButton = element.querySelector<HTMLButtonElement>(
      '[data-testid="save-button"]',
    )!;
    saveButton.click();

    expect(clickSpy).toHaveBeenCalled();
    const anchor = clickSpy.calls.mostRecent().object as HTMLAnchorElement;
    expect(anchor.download).toBe('digicloak-test.png');
  });

  it('flags an image that already holds a message', async () => {
    const encoded = await getEncodedBase64Image(
      createTestImage(),
      'existing',
      'pw',
    );
    const input = element.querySelector<HTMLInputElement>('#image')!;
    setInputFile(input, dataUrlToFile(encoded, 'old.png', 'image/png'));

    await waitFor(
      fixture,
      () =>
        element.querySelector<HTMLElement>(
          'app-collapse:has([data-testid="existing-message"])',
        )?.style.gridTemplateRows === '1fr',
    );
    expect(
      element.querySelector('[data-testid="reveal-instead"]'),
    ).not.toBeNull();
  });

  it('does not flag a plain image', async () => {
    await chooseImage();
    await new Promise((resolve) => setTimeout(resolve, 300));
    fixture.detectChanges();
    expect(
      element.querySelector<HTMLElement>(
        'app-collapse:has([data-testid="existing-message"])',
      )?.style.gridTemplateRows,
    ).toBe('0fr');
  });
});
