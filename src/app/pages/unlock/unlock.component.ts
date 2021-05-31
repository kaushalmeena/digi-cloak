import { Component, OnInit } from '@angular/core';
import { SMALLEST_IMAGE_SOURCE } from 'src/constants';
import { readImage, copyData, getDecodedMessage } from 'src/utils';

@Component({
  selector: 'app-unlock',
  templateUrl: './unlock.component.html',
  styleUrls: ['./unlock.component.scss']
})
export class UnlockComponent implements OnInit {
  previewImageSource: string
  decodedMessage: string
  isOutputVisible: boolean

  constructor() {
    this.previewImageSource = SMALLEST_IMAGE_SOURCE;
    this.decodedMessage = "";
    this.isOutputVisible = false;
  }

  ngOnInit(): void {
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
    copyData(this.decodedMessage);
  }

}
