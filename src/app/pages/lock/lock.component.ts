import { Component } from '@angular/core';
import {
  getEncodedBase64Image,
  getBase64ImageFromBlob,
  saveImage,
} from 'app/shared/utils';

@Component({
  selector: 'app-lock',
  templateUrl: './lock.component.html',
  styleUrls: ['./lock.component.scss'],
})
export class LockComponent {
  previewImageSource = '';
  encodedImageSource = '';
  isOutputVisible = false;

  constructor() {}

  handlePreview(event: Event) {
    const target = event.target as HTMLInputElement;
    const files = target.files as FileList;
    const imageFile = files[0];

    getBase64ImageFromBlob(imageFile).then((src) => {
      this.previewImageSource = src;
    });
  }

  handleSubmit(event: Event) {
    event.preventDefault();
    const target = event.target as HTMLFormElement;
    const message = target.message.value as string;
    const password = target.password.value as string;
    this.encodedImageSource = getEncodedBase64Image(
      this.previewImageSource,
      message,
      password
    );
    this.isOutputVisible = true;
  }

  handleSave() {
    saveImage(this.encodedImageSource);
  }
}
