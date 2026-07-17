import { Component, inject, signal, viewChild } from '@angular/core';

import { Dropzone } from '../../components/dropzone/dropzone';
import { Figure } from '../../components/figure/figure';
import { Loader } from '../../components/loader/loader';
import { Password } from '../../components/password/password';
import { Snackbar } from '../../components/snackbar/snackbar';
import { Textbox } from '../../components/textbox/textbox';
import { Stegano } from '../../services/stegano';
import { copyText, getBase64ImageFromBlob } from '../../utils/browser';

@Component({
  selector: 'app-unlock',
  imports: [Dropzone, Figure, Loader, Password, Snackbar, Textbox],
  templateUrl: './unlock.html',
})
export class Unlock {
  private readonly stegano = inject(Stegano);

  protected readonly previewImageSource = signal('');
  protected readonly decodedMessage = signal('');
  protected readonly busy = signal(false);

  private readonly snackbar = viewChild.required(Snackbar);

  protected handleFile(file: File | null): void {
    this.decodedMessage.set('');
    if (!file) {
      this.previewImageSource.set('');
      return;
    }

    getBase64ImageFromBlob(file)
      .then((src) => {
        this.previewImageSource.set(src);
      })
      .catch((err) => {
        this.snackbar().show(err.message);
      });
  }

  protected handleSubmit(event: Event): void {
    event.preventDefault();

    if (!this.previewImageSource()) {
      this.snackbar().show('Please choose an image first');
      return;
    }

    const target = event.target as HTMLFormElement;
    const password = target['password'].value as string;

    this.busy.set(true);
    this.stegano
      .decode(this.previewImageSource(), password)
      .then((msg) => {
        this.decodedMessage.set(msg);
      })
      .catch((err) => {
        this.snackbar().show(err.message);
      })
      .finally(() => {
        this.busy.set(false);
      });
  }

  protected handleCopy(): void {
    copyText(this.decodedMessage())
      .then(() => {
        this.snackbar().show('Copied to clipboard', 'success');
      })
      .catch((err) => {
        this.snackbar().show(err.message);
      });
  }
}
