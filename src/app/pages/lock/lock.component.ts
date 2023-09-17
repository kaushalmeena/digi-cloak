import { Component, ViewChild } from '@angular/core';
import { SnackbarComponent } from 'src/app/components/snackbar/snackbar.component';
import {
  getBase64ImageFromBlob,
  getEncodedBase64Image,
  saveImage,
} from 'src/app/utils';

@Component({
  selector: 'app-lock',
  templateUrl: './lock.component.html',
  styleUrls: ['./lock.component.scss'],
})
export class LockComponent {
  previewImageSource = '';
  encodedImageSource = '';
  isOutputVisible = false;

  @ViewChild(SnackbarComponent)
  snackbar!: SnackbarComponent;

  constructor() {}

  handlePreview(event: Event) {
    const target = event.target as HTMLInputElement;
    const files = target.files as FileList;

    const imageFile = files.item(0);

    if (imageFile) {
      getBase64ImageFromBlob(imageFile)
        .then((src) => {
          this.previewImageSource = src;
        })
        .catch((err) => {
          this.snackbar.show(err.message);
        });
    } else {
      this.previewImageSource = '';
    }
  }

  handleSubmit(event: Event) {
    event.preventDefault();

    const target = event.target as HTMLFormElement;
    const message = target['message'].value as string;
    const password = target['password'].value as string;

    getEncodedBase64Image(this.previewImageSource, message, password)
      .then((src) => {
        this.encodedImageSource = src;
        this.isOutputVisible = true;
      })
      .catch((err) => {
        this.snackbar.show(err.message);
      });
  }

  handleSave() {
    saveImage(this.encodedImageSource);
  }
}
