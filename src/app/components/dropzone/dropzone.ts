import {
  ChangeDetectionStrategy,
  Component,
  computed,
  ElementRef,
  input,
  output,
  signal,
  viewChild,
} from '@angular/core';

import { Icon } from '../icon/icon';

export function formatSize(bytes: number): string {
  if (bytes < 1024) {
    return `${bytes} B`;
  }
  if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(1)} KB`;
  }
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

/**
 * Image picker that becomes its own preview once a file is chosen.
 * Accepts click-to-browse, drag and drop anywhere on it, and paste.
 */
@Component({
  selector: 'app-dropzone',
  imports: [Icon],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './dropzone.html',
  host: {
    class: 'block',
    '(document:paste)': 'onPaste($event)',
  },
})
export class Dropzone {
  readonly inputId = input.required<string>();
  readonly label = input.required<string>();
  readonly accept = input('image/*');
  /** Formats shown in the empty state, e.g. "PNG, JPEG or WebP" */
  readonly formats = input('PNG, JPEG, GIF or WebP');
  /** Data URL of the chosen image, supplied by the parent once read */
  readonly preview = input('');
  /** Extra detail for the file row, e.g. pixel dimensions */
  readonly details = input('');
  readonly fileChange = output<File | null>();

  protected readonly file = signal<File | null>(null);
  protected readonly dragging = signal(false);

  protected readonly fileMeta = computed(() => {
    const file = this.file();
    if (!file) {
      return '';
    }
    const details = this.details();
    return details
      ? `${formatSize(file.size)} · ${details}`
      : formatSize(file.size);
  });

  private readonly fileInput =
    viewChild.required<ElementRef<HTMLInputElement>>('fileInput');

  protected handleBrowse(): void {
    this.fileInput().nativeElement.click();
  }

  protected handleRemove(): void {
    this.fileInput().nativeElement.value = '';
    this.selectFile(null);
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

  protected onDragLeave(event: DragEvent): void {
    // Ignore leave events fired when moving between child elements.
    const related = event.relatedTarget as Node | null;
    if (!related || !(event.currentTarget as Node).contains(related)) {
      this.dragging.set(false);
    }
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
