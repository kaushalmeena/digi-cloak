import { ComponentFixture, TestBed } from '@angular/core/testing';

import {
  createTestImageFile,
  flush,
  setInputFile,
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

  it('should create', () => {
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('shows a preview once an image file is chosen', async () => {
    const input = element.querySelector<HTMLInputElement>('#image')!;
    setInputFile(input, createTestImageFile());
    await flush(fixture);

    const img = element.querySelector<HTMLImageElement>(
      'img[alt="Preview-Image"]'
    );
    expect(img?.src).toMatch(/^data:image\/png;base64,/);
  });

  it('clears the preview when the file selection is removed', async () => {
    const input = element.querySelector<HTMLInputElement>('#image')!;
    setInputFile(input, createTestImageFile());
    await flush(fixture);
    expect(
      element.querySelector('img[alt="Preview-Image"]')
    ).not.toBeNull();

    setInputFile(input, null);
    fixture.detectChanges();
    expect(element.querySelector('img[alt="Preview-Image"]')).toBeNull();
  });

  it('encodes the message into the image on submit', async () => {
    const input = element.querySelector<HTMLInputElement>('#image')!;
    setInputFile(input, createTestImageFile());
    await flush(fixture);

    element.querySelector<HTMLTextAreaElement>('#message')!.value =
      'top secret';
    element.querySelector<HTMLInputElement>('#password')!.value = 'hunter2';

    const form = element.querySelector('form')!;
    form.dispatchEvent(new Event('submit', { cancelable: true }));
    await flush(fixture);

    const outputImg = element.querySelector<HTMLImageElement>(
      'img[alt="Output-Image"]'
    );
    expect(outputImg?.src).toMatch(/^data:image\/png;base64,/);

    const saveButton = element.querySelector<HTMLButtonElement>(
      '.button-container button[type="button"]'
    )!;
    expect(saveButton.disabled).toBeFalse();

    const decoded = await getDecodedMessage(outputImg!.src, 'hunter2');
    expect(decoded).toBe('top secret');
  });

  it('shows an error in the snackbar when the chosen file is not a valid image', async () => {
    const input = element.querySelector<HTMLInputElement>('#image')!;
    const textFile = new File(['not an image'], 'notes.txt', {
      type: 'text/plain',
    });
    setInputFile(input, textFile);
    await flush(fixture);

    element.querySelector<HTMLTextAreaElement>('#message')!.value =
      'top secret';
    element.querySelector<HTMLInputElement>('#password')!.value = 'hunter2';

    const form = element.querySelector('form')!;
    form.dispatchEvent(new Event('submit', { cancelable: true }));
    await flush(fixture);

    expect(element.querySelector('.snackbar')?.textContent).toContain(
      'Cannot load base64 image'
    );
  });

  it('triggers a download when Save is clicked after encoding', async () => {
    const clickSpy = spyOn(HTMLAnchorElement.prototype, 'click');

    const input = element.querySelector<HTMLInputElement>('#image')!;
    setInputFile(input, createTestImageFile());
    await flush(fixture);

    element.querySelector<HTMLTextAreaElement>('#message')!.value =
      'top secret';
    element.querySelector<HTMLInputElement>('#password')!.value = 'hunter2';
    const form = element.querySelector('form')!;
    form.dispatchEvent(new Event('submit', { cancelable: true }));
    await flush(fixture);

    const saveButton = element.querySelector<HTMLButtonElement>(
      '.button-container button[type="button"]'
    )!;
    saveButton.click();

    expect(clickSpy).toHaveBeenCalled();
  });
});
