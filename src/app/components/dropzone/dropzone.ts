import { Component, input, output, signal } from '@angular/core';

function formatSize(bytes: number): string {
  if (bytes < 1024) {
    return `${bytes} B`;
  }
  if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(1)} KB`;
  }
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

@Component({
  selector: 'app-dropzone',
  templateUrl: './dropzone.html',
  host: {
    '(document:paste)': 'onPaste($event)',
  },
})
export class Dropzone {
  readonly inputId = input.required<string>();
  readonly label = input.required<string>();
  readonly accept = input('image/*');
  readonly fileChange = output<File | null>();

  protected readonly file = signal<File | null>(null);
  protected readonly dragging = signal(false);

  protected fileInfo(): string {
    const file = this.file();
    return file ? `${file.name} · ${formatSize(file.size)}` : '';
  }

  protected onInputChange(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.selectFile(target.files?.item(0) ?? null);
  }

  protected onDrop(event: DragEvent): void {
    event.preventDefault();
    this.dragging.set(false);
    const file = event.dataTransfer?.files.item(0) ?? null;
    if (file?.type.startsWith('image/')) {
      this.selectFile(file);
    }
  }

  protected onDragOver(event: DragEvent): void {
    event.preventDefault();
    this.dragging.set(true);
  }

  protected onDragLeave(): void {
    this.dragging.set(false);
  }

  protected onPaste(event: ClipboardEvent): void {
    const items = event.clipboardData?.items ?? [];
    for (const item of items) {
      if (item.kind === 'file' && item.type.startsWith('image/')) {
        this.selectFile(item.getAsFile());
        return;
      }
    }
  }

  private selectFile(file: File | null): void {
    this.file.set(file);
    this.fileChange.emit(file);
  }
}
