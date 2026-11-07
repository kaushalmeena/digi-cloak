import { ComponentFixture, TestBed } from '@angular/core/testing';

import { createTestImageFile, setInputFile } from '../../testing/fixtures';
import { Dropzone } from './dropzone';

describe('Dropzone', () => {
  let fixture: ComponentFixture<Dropzone>;
  let element: HTMLElement;
  let received: (File | null)[];

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Dropzone],
    }).compileComponents();

    fixture = TestBed.createComponent(Dropzone);
    fixture.componentRef.setInput('inputId', 'image');
    fixture.componentRef.setInput('label', 'Image');
    received = [];
    fixture.componentInstance.fileChange.subscribe((file) =>
      received.push(file),
    );
    element = fixture.nativeElement;
    fixture.detectChanges();
  });

  it('shows the browse hint by default', () => {
    expect(
      element.querySelector('[data-testid="dropzone"]')?.textContent,
    ).toContain('click to browse');
  });

  it('emits the file and shows its info when chosen via the input', () => {
    const input = element.querySelector<HTMLInputElement>('#image')!;
    setInputFile(input, createTestImageFile());
    fixture.detectChanges();

    expect(received.length).toBe(1);
    expect(received[0]?.name).toBe('test.png');
    expect(
      element.querySelector('[data-testid="file-info"]')?.textContent,
    ).toContain('test.png');
  });

  it('emits the file on drop', () => {
    const dataTransfer = new DataTransfer();
    dataTransfer.items.add(createTestImageFile());
    const drop = new DragEvent('drop', { dataTransfer, bubbles: true });

    element.querySelector('[data-testid="dropzone"]')!.dispatchEvent(drop);
    fixture.detectChanges();

    expect(received.length).toBe(1);
    expect(received[0]?.name).toBe('test.png');
  });

  it('emits the file on paste', () => {
    const dataTransfer = new DataTransfer();
    dataTransfer.items.add(createTestImageFile());
    const paste = new ClipboardEvent('paste', {
      clipboardData: dataTransfer,
    });

    document.dispatchEvent(paste);
    fixture.detectChanges();

    expect(received.length).toBe(1);
    expect(received[0]?.name).toBe('test.png');
  });

  it('ignores non-image drops', () => {
    const dataTransfer = new DataTransfer();
    dataTransfer.items.add(
      new File(['plain'], 'notes.txt', { type: 'text/plain' }),
    );
    const drop = new DragEvent('drop', { dataTransfer, bubbles: true });

    element.querySelector('[data-testid="dropzone"]')!.dispatchEvent(drop);
    fixture.detectChanges();

    expect(received.length).toBe(0);
  });

  it('shows the supplied preview and removes the file on request', () => {
    const input = element.querySelector<HTMLInputElement>('#image')!;
    setInputFile(input, createTestImageFile());
    fixture.componentRef.setInput('preview', 'data:image/png;base64,AAAA');
    fixture.detectChanges();

    expect(
      element.querySelector<HTMLImageElement>('img[alt="Selected image"]')?.src,
    ).toContain('data:image/png');

    element
      .querySelector<HTMLButtonElement>('[data-testid="remove-image"]')!
      .click();
    fixture.detectChanges();

    expect(received.at(-1)).toBeNull();
    expect(element.querySelector('[data-testid="dropzone"]')).not.toBeNull();
  });

  it('selects a file handed over programmatically', () => {
    fixture.componentInstance.select(createTestImageFile());
    fixture.detectChanges();
    expect(received.at(-1)?.name).toBe('test.png');
    expect(
      element.querySelector('[data-testid="file-info"]')?.textContent,
    ).toContain('test.png');
  });

  it('explains an invalid link without submitting anything', async () => {
    element
      .querySelector<HTMLButtonElement>('[data-testid="link-image"]')!
      .click();
    fixture.detectChanges();
    const field = element.querySelector<HTMLInputElement>('#image-link')!;
    field.value = 'not a link';
    element
      .querySelector<HTMLButtonElement>('[data-testid="load-link"]')!
      .click();
    await new Promise((resolve) => setTimeout(resolve, 0));
    fixture.detectChanges();

    expect(
      element.querySelector('[data-testid="load-error"]')?.textContent,
    ).toContain('https://');
    expect(received.length).toBe(0);
  });
});
