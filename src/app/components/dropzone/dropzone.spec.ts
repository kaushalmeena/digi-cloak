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
    received = [];
    fixture.componentInstance.fileChange.subscribe((file) =>
      received.push(file)
    );
    element = fixture.nativeElement;
    fixture.detectChanges();
  });

  it('shows the browse hint by default', () => {
    expect(element.querySelector('.dropzone')?.textContent).toContain(
      'click to browse'
    );
  });

  it('emits the file and shows its info when chosen via the input', () => {
    const input = element.querySelector<HTMLInputElement>('#image')!;
    setInputFile(input, createTestImageFile());
    fixture.detectChanges();

    expect(received.length).toBe(1);
    expect(received[0]?.name).toBe('test.png');
    expect(element.querySelector('.file-info')?.textContent).toContain(
      'test.png'
    );
  });

  it('emits the file on drop', () => {
    const dataTransfer = new DataTransfer();
    dataTransfer.items.add(createTestImageFile());
    const drop = new DragEvent('drop', { dataTransfer });

    element.querySelector('.dropzone')!.dispatchEvent(drop);
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
      new File(['plain'], 'notes.txt', { type: 'text/plain' })
    );
    const drop = new DragEvent('drop', { dataTransfer });

    element.querySelector('.dropzone')!.dispatchEvent(drop);
    fixture.detectChanges();

    expect(received.length).toBe(0);
  });
});
