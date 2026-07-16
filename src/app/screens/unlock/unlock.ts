import { Component, signal, viewChild } from '@angular/core';

import { ImageCard } from '../../components/image-card/image-card';
import { Snackbar } from '../../components/snackbar/snackbar';
import { copyText, getBase64ImageFromBlob } from '../../utils/browser';
import { getDecodedMessage } from '../../utils/stegano';

@Component({
  selector: 'app-unlock',
  imports: [ImageCard, Snackbar],
  templateUrl: './unlock.html',
})
export class Unlock {
  protected readonly previewImageSource = signal('');
  protected readonly decodedMessage = signal('');

  private readonly snackbar = viewChild.required(Snackbar);

  protected handlePreview(event: Event): void {
    const target = event.target as HTMLInputElement;
    const files = target.files as FileList;

    const imageFile = files.item(0);

    if (imageFile) {
      getBase64ImageFromBlob(imageFile)
        .then((src) => {
          this.previewImageSource.set(src);
        })
        .catch((err) => {
          this.snackbar().show(err.message);
        });
    } else {
      this.previewImageSource.set('');
    }
  }

  protected handleSubmit(event: Event): void {
    event.preventDefault();

    const target = event.target as HTMLFormElement;
    const password = target['password'].value as string;

    getDecodedMessage(this.previewImageSource(), password)
      .then((msg) => {
        this.decodedMessage.set(msg);
      })
      .catch((err) => {
        this.snackbar().show(err.message);
      });
  }

  protected handleCopy(): void {
    copyText(this.decodedMessage())
      .then(() => {
        this.snackbar().show('Copied to clipboard');
      })
      .catch((err) => {
        this.snackbar().show(err.message);
      });
  }
}
