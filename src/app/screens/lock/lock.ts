import { Component, signal, viewChild } from '@angular/core';

import { Snackbar } from '../../components/snackbar/snackbar';
import { getBase64ImageFromBlob, saveImage } from '../../utils/browser';
import { getEncodedBase64Image } from '../../utils/stegano';

@Component({
  selector: 'app-lock',
  imports: [Snackbar],
  templateUrl: './lock.html',
  styleUrl: './lock.css',
})
export class Lock {
  protected readonly previewImageSource = signal('');
  protected readonly encodedImageSource = signal('');

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
    const message = target['message'].value as string;
    const password = target['password'].value as string;

    getEncodedBase64Image(this.previewImageSource(), message, password)
      .then((src) => {
        this.encodedImageSource.set(src);
      })
      .catch((err) => {
        this.snackbar().show(err.message);
      });
  }

  protected handleSave(): void {
    saveImage(this.encodedImageSource());
  }
}
