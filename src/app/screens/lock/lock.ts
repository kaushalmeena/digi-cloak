import {
  Component,
  computed,
  ElementRef,
  inject,
  signal,
  viewChild,
} from '@angular/core';

import { Dropzone } from '../../components/dropzone/dropzone';
import { Figure } from '../../components/figure/figure';
import { Loader } from '../../components/loader/loader';
import { Compare } from '../../components/compare/compare';
import { Password } from '../../components/password/password';
import { Snackbar } from '../../components/snackbar/snackbar';
import { Stegano } from '../../services/stegano';
import { getBase64ImageFromBlob, saveImage } from '../../utils/browser';
import { estimateCapacityChars, messageFits } from '../../utils/stegano';

interface ImageSize {
  width: number;
  height: number;
}

function readImageSize(src: string): Promise<ImageSize> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () =>
      resolve({ width: image.width, height: image.height });
    image.onerror = () => reject(new Error('Cannot load base64 image'));
    image.src = src;
  });
}

@Component({
  selector: 'app-lock',
  imports: [Compare, Dropzone, Figure, Loader, Password, Snackbar],
  templateUrl: './lock.html',
})
export class Lock {
  private readonly stegano = inject(Stegano);

  protected readonly previewImageSource = signal('');
  protected readonly encodedImageSource = signal('');
  protected readonly imageName = signal('');
  protected readonly imageSize = signal<ImageSize | null>(null);
  protected readonly messageBytes = signal(0);
  protected readonly busy = signal(false);

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

  private readonly snackbar = viewChild.required(Snackbar);
  private readonly compareDialog =
    viewChild.required<ElementRef<HTMLDialogElement>>('compareDialog');

  protected readonly compareClosing = signal(false);

  protected openCompare(): void {
    this.compareDialog().nativeElement.showModal();
  }

  protected closeCompare(): void {
    if (this.compareClosing()) {
      return;
    }
    // Native <dialog>.close() is instant; play the exit animation first.
    this.compareClosing.set(true);
    window.setTimeout(() => {
      this.compareDialog().nativeElement.close();
      this.compareClosing.set(false);
    }, 150);
  }

  protected onDialogCancel(event: Event): void {
    event.preventDefault();
    this.closeCompare();
  }

  protected onDialogClick(event: MouseEvent): void {
    // Native <dialog>: a click on the backdrop targets the dialog element
    // itself, while clicks on content target descendants.
    if (event.target === this.compareDialog().nativeElement) {
      this.closeCompare();
    }
  }

  protected handleFile(file: File | null): void {
    this.encodedImageSource.set('');
    if (!file) {
      this.previewImageSource.set('');
      this.imageName.set('');
      this.imageSize.set(null);
      return;
    }

    this.imageName.set(file.name);
    getBase64ImageFromBlob(file)
      .then(async (src) => {
        this.previewImageSource.set(src);
        this.imageSize.set(await readImageSize(src));
      })
      .catch((err) => {
        this.snackbar().show(err.message);
      });
  }

  protected handleMessageInput(event: Event): void {
    const value = (event.target as HTMLTextAreaElement).value;
    this.messageBytes.set(new TextEncoder().encode(value).length);
  }

  protected handleSubmit(event: Event): void {
    event.preventDefault();

    if (!this.previewImageSource()) {
      this.snackbar().show('Please choose an image first');
      return;
    }
    if (!this.fits()) {
      this.snackbar().show('Message length is too large to hide in image');
      return;
    }

    const target = event.target as HTMLFormElement;
    const message = target['message'].value as string;
    const password = target['password'].value as string;

    this.busy.set(true);
    this.stegano
      .encode(this.previewImageSource(), message, password)
      .then((src) => {
        this.encodedImageSource.set(src);
      })
      .catch((err) => {
        this.snackbar().show(err.message);
      })
      .finally(() => {
        this.busy.set(false);
      });
  }

  protected handleSave(): void {
    const stem = this.imageName().replace(/\.[^.]+$/, '') || 'output';
    saveImage(this.encodedImageSource(), `digicloak-${stem}.png`);
  }
}
