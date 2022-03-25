import { Component } from '@angular/core';
import { getDecodedMessage, readImage, saveText } from 'src/utils';

@Component({
  selector: 'app-unlock',
  templateUrl: './unlock.component.html',
  styleUrls: ['./unlock.component.scss']
})
export class UnlockComponent {
  previewImageSource: string
  decodedMessage: string
  isOutputVisible: boolean

  constructor() {
    this.previewImageSource = "";
    this.decodedMessage = "";
    this.isOutputVisible = false;
  }

  handlePreview(event: Event) {
    const target = event.target as HTMLInputElement;
    const files = target.files as FileList;
    const imageFile = files[0];

    readImage(imageFile)
      .then((src) => {
        this.previewImageSource = src;
      });
  }

  handleSubmit(event: any) {
    event.preventDefault();
    const password = event.target.elements.password.value;
    this.decodedMessage = getDecodedMessage(this.previewImageSource, password);
    this.isOutputVisible = true;
  }

  handleCopy() {
    saveText(this.decodedMessage);
  }

}
