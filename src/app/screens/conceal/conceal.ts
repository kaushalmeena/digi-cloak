import {
  afterNextRender,
  ChangeDetectionStrategy,
  Component,
  computed,
  ElementRef,
  inject,
  Injector,
  linkedSignal,
  signal,
  viewChild,
} from '@angular/core';

import { Alert } from '../../components/alert/alert';
import { Capacity } from '../../components/capacity/capacity';
import { Collapse } from '../../components/collapse/collapse';
import { Compare } from '../../components/compare/compare';
import { Dropzone } from '../../components/dropzone/dropzone';
import { Icon } from '../../components/icon/icon';
import { Intro } from '../../components/intro/intro';
import { Loader } from '../../components/loader/loader';
import { Password } from '../../components/password/password';
import { Tabs } from '../../components/tabs/tabs';
import { Textbox } from '../../components/textbox/textbox';
import { Router } from '@angular/router';

import { Handoff } from '../../services/handoff';
import { Stegano } from '../../services/stegano';
import {
  canShareFiles,
  dataUrlToFile,
  getBase64ImageFromBlob,
  saveImage,
  shareFile,
} from '../../utils/browser';
import { estimateCapacityChars, messageFits } from '../../utils/stegano';

interface ImageSize {
  width: number;
  height: number;
}

function readImageSize(src: string): Promise<ImageSize> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve({ width: image.width, height: image.height });
    image.onerror = () => reject(new Error('Cannot load base64 image'));
    image.src = src;
  });
}

const prefersReducedMotion = (): boolean =>
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

@Component({
  selector: 'app-conceal',
  imports: [
    Alert,
    Capacity,
    Collapse,
    Compare,
    Dropzone,
    Icon,
    Intro,
    Loader,
    Password,
    Tabs,
    Textbox,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './conceal.html',
})
export class Conceal {
  private readonly stegano = inject(Stegano);
  private readonly injector = inject(Injector);
  private readonly router = inject(Router);
  private readonly handoff = inject(Handoff);

  protected readonly canShare = canShareFiles();
  /** The chosen image already carries a Digi-Cloak message. */
  protected readonly hasExistingMessage = signal(false);
  private currentFile: File | null = null;

  protected readonly previewImageSource = signal('');
  protected readonly encodedImageSource = signal('');
  protected readonly imageName = signal('');
  protected readonly imageSize = signal<ImageSize | null>(null);
  protected readonly messageBytes = signal(0);
  protected readonly busy = signal(false);
  protected readonly error = signal('');
  /** Keeps the last error's text while the alert collapses away. */
  protected readonly visibleError = linkedSignal<string, string>({
    source: this.error,
    computation: (error, previous) => error || previous?.value || '',
  });

  protected readonly capacity = computed(() => {
    const size = this.imageSize();
    return size ? estimateCapacityChars(size.width, size.height) : null;
  });

  protected readonly fits = computed(() => {
    const size = this.imageSize();
    return size
      ? messageFits(size.width, size.height, this.messageBytes())
      : true;
  });

  protected readonly imageDetails = computed(() => {
    const size = this.imageSize();
    return size ? `${size.width} × ${size.height} px` : '';
  });

  protected readonly outputName = computed(() => {
    const stem = this.imageName().replace(/\.[^.]+$/, '') || 'output';
    return `digicloak-${stem}.png`;
  });

  private readonly compareDialog =
    viewChild.required<ElementRef<HTMLDialogElement>>('compareDialog');
  private readonly result = viewChild<ElementRef<HTMLElement>>('result');

  protected openCompare(): void {
    this.compareDialog().nativeElement.showModal();
  }

  // Enter/exit animation is pure CSS (@starting-style + allow-discrete
  // transitions on the dialog), so closing needs no choreography here.
  protected closeCompare(): void {
    this.compareDialog().nativeElement.close();
  }

  protected onDialogClick(event: MouseEvent): void {
    // Native <dialog>: a click on the backdrop targets the dialog element
    // itself, while clicks on content target descendants.
    if (event.target === this.compareDialog().nativeElement) {
      this.closeCompare();
    }
  }

  protected handleFile(file: File | null): void {
    this.resetResult();
    this.previewImageSource.set('');
    this.imageSize.set(null);
    this.imageName.set(file?.name ?? '');
    this.hasExistingMessage.set(false);
    this.currentFile = file;
    if (!file) {
      return;
    }

    getBase64ImageFromBlob(file)
      .then(async (src) => {
        this.previewImageSource.set(src);
        this.imageSize.set(await readImageSize(src));
        const found = await this.stegano.detect(src).catch(() => false);
        // Ignore the answer if another image was chosen meanwhile.
        if (this.currentFile === file) {
          this.hasExistingMessage.set(found);
        }
      })
      .catch(() => {
        this.error.set("That file couldn't be read as an image.");
      });
  }

  protected handleMessageInput(value: string): void {
    this.resetResult();
    this.messageBytes.set(new TextEncoder().encode(value).length);
  }

  protected handlePasswordInput(): void {
    this.resetResult();
  }

  protected handleSubmit(event: Event): void {
    event.preventDefault();

    if (!this.previewImageSource()) {
      this.error.set('Choose an image to conceal the message in.');
      return;
    }
    if (!this.fits()) {
      this.error.set(
        'This message is too long for the image. Shorten it or use a larger image.',
      );
      return;
    }

    const target = event.target as HTMLFormElement;
    const message = target['message'].value as string;
    const password = target['password'].value as string;

    this.error.set('');
    this.busy.set(true);
    this.stegano
      .encode(this.previewImageSource(), message, password)
      .then((src) => {
        this.encodedImageSource.set(src);
        this.revealResult();
      })
      .catch((err: Error) => {
        this.error.set(err.message);
      })
      .finally(() => {
        this.busy.set(false);
      });
  }

  protected handleUncoverInstead(): void {
    if (this.currentFile) {
      this.handoff.give(this.currentFile);
    }
    void this.router.navigate(['/uncover']);
  }

  protected handleShare(): void {
    dataUrlToFile(this.encodedImageSource(), this.outputName())
      .then(shareFile)
      .catch(() => {
        this.error.set(
          "Couldn't open the share sheet. Download the PNG instead.",
        );
      });
  }

  protected handleSave(): void {
    saveImage(this.encodedImageSource(), this.outputName());
  }

  /** Any edit makes a finished result stale, so it is cleared rather than kept. */
  private resetResult(): void {
    this.encodedImageSource.set('');
    this.error.set('');
  }

  private revealResult(): void {
    afterNextRender(
      () => {
        this.result()?.nativeElement.scrollIntoView({
          behavior: prefersReducedMotion() ? 'auto' : 'smooth',
          block: 'nearest',
        });
      },
      { injector: this.injector },
    );
  }
}
