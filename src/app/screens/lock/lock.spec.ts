import { ComponentFixture, TestBed } from '@angular/core/testing';

import {
  createTestImageFile,
  setInputFile,
  waitFor,
} from '../../testing/fixtures';
import { getDecodedMessage } from '../../utils/stegano';
import { Lock } from './lock';

describe('Lock', () => {
  let fixture: ComponentFixture<Lock>;
  let element: HTMLElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Lock],
    }).compileComponents();

    fixture = TestBed.createComponent(Lock);
    element = fixture.nativeElement;
    fixture.detectChanges();
  });

  async function chooseImage(): Promise<void> {
    const input = element.querySelector<HTMLInputElement>('#image')!;
    setInputFile(input, createTestImageFile());
    await waitFor(fixture, () =>
      element.querySelector('img[alt="Preview-Image"]'),
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
      'img[alt="Preview-Image"]',
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
    expect(element.querySelector('img[alt="Preview-Image"]')).toBeNull();
  });

  it('encodes the message into the image on submit', async () => {
    await chooseImage();
    submit('top secret', 'hunter2');
    await waitFor(fixture, () =>
      element.querySelector('img[alt="Output-Image"]'),
    );

    const outputImg = element.querySelector<HTMLImageElement>(
      'img[alt="Output-Image"]',
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

  it('shows an error in the snackbar when no image is chosen', async () => {
    submit('top secret', 'hunter2');
    await waitFor(fixture, () =>
      element.querySelector('[data-testid="snackbar"]'),
    );

    expect(
      element.querySelector('[data-testid="snackbar"]')?.textContent,
    ).toContain('Please choose an image first');
  });

  it('triggers a download with a digicloak filename when Save is clicked', async () => {
    const clickSpy = spyOn(HTMLAnchorElement.prototype, 'click');

    await chooseImage();
    submit('top secret', 'hunter2');
    await waitFor(fixture, () =>
      element.querySelector('img[alt="Output-Image"]'),
    );

    const saveButton = element.querySelector<HTMLButtonElement>(
      '[data-testid="save-button"]',
    )!;
    saveButton.click();

    expect(clickSpy).toHaveBeenCalled();
    const anchor = clickSpy.calls.mostRecent().object as HTMLAnchorElement;
    expect(anchor.download).toBe('digicloak-test.png');
  });
});
