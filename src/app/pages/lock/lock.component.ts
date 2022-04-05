import { Component } from '@angular/core';
import { getEncodedBase64Image, getBase64ImageFromBlob, saveImage } from 'app/shared/utils';

@Component({
  selector: 'app-lock',
  templateUrl: './lock.component.html',
  styleUrls: ['./lock.component.scss']
})
export class LockComponent {
  previewImageSource: string
  encodedImageSource: string
  isOutputVisible: boolean

  constructor() {
    this.previewImageSource = "";
    this.encodedImageSource = "";
    this.isOutputVisible = false;
  }

  handlePreview(event: Event) {
    const target = event.target as HTMLInputElement;
    const files = target.files as FileList;
    const imageFile = files[0];

    getBase64ImageFromBlob(imageFile)
      .then((src) => {
        this.previewImageSource = src;
      });
  }

  handleSubmit(event: any) {
    event.preventDefault();
    const message = event.target.elements.message.value;
    const password = event.target.elements.password.value;
    this.encodedImageSource = getEncodedBase64Image(this.previewImageSource, message, password);;
    this.isOutputVisible = true;
  }

  handleSave() {
    saveImage(this.encodedImageSource);
  }
}
