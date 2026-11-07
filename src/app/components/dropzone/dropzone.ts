import {
  ChangeDetectionStrategy,
  Component,
  computed,
  ElementRef,
  input,
  linkedSignal,
  output,
  signal,
  viewChild,
} from '@angular/core';

import {
  canReadClipboardImages,
  fetchImageFile,
  readClipboardImage,
} from '../../utils/browser';
import { Collapse } from '../collapse/collapse';
import { Icon } from '../icon/icon';
import { Loader } from '../loader/loader';

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
  imports: [Collapse, Icon, Loader],
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
  protected readonly linkMode = signal(false);
  protected readonly loading = signal(false);
  protected readonly loadError = signal('');
  /** Keeps the last text while the error collapses away. */
  protected readonly visibleLoadError = linkedSignal<string, string>({
    source: this.loadError,
    computation: (error, previous) => error || previous?.value || '',
  });
  protected readonly canPaste = canReadClipboardImages();

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
  private readonly linkField =
    viewChild<ElementRef<HTMLInputElement>>('linkField');

  /** Programmatic selection, e.g. an image handed over from the other mode. */
  select(file: File): void {
    this.selectFile(file);
  }

  protected handlePasteClick(): void {
    void this.pasteFromClipboard();
  }

  protected handleOpenLink(): void {
    this.loadError.set('');
    this.linkMode.set(true);
    // Focus once the input has rendered.
    setTimeout(() => this.linkField()?.nativeElement.focus());
  }

  protected handleCancelLink(): void {
    this.linkMode.set(false);
    this.loadError.set('');
  }

  protected onLinkEnter(event: Event): void {
    // Enter inside the parent form would otherwise submit it.
    event.preventDefault();
    this.handleLoadLink();
  }

  protected handleLoadLink(): void {
    const link = this.linkField()?.nativeElement.value.trim() ?? '';
    if (!link) {
      this.loadError.set('Paste or type a link to an image.');
      return;
    }
    this.loading.set(true);
    this.loadError.set('');
    fetchImageFile(link)
      .then((file) => {
        this.linkMode.set(false);
        this.selectFile(file);
      })
      .catch((error: Error) => this.loadError.set(error.message))
      .finally(() => this.loading.set(false));
  }

  private async pasteFromClipboard(): Promise<void> {
    this.loadError.set('');
    try {
      const file = await readClipboardImage();
      if (file) {
        this.selectFile(file);
      } else {
        this.loadError.set("There's no image on the clipboard.");
      }
    } catch {
      this.loadError.set(
        'Clipboard access was blocked. Press Ctrl+V (or ⌘V) to paste instead.',
      );
    }
  }

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
    this.loadError.set('');
    this.file.set(file);
    this.fileChange.emit(file);
  }
}
