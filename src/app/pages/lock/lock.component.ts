import { Component, OnInit } from '@angular/core';
import { getEncodedImageSource, readImage, saveImage } from 'src/utils';

@Component({
  selector: 'app-lock',
  templateUrl: './lock.component.html',
  styleUrls: ['./lock.component.scss']
})
export class LockComponent implements OnInit {
  previewImageSource: string
  encodedImageSource: string
  isOutputVisible: boolean

  constructor() {
    this.previewImageSource = "";
    this.encodedImageSource = "";
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
    const message = event.target.elements.message.value;
    const password = event.target.elements.password.value;
    this.encodedImageSource = getEncodedImageSource(this.previewImageSource, message, password);;
    this.isOutputVisible = true;
  }

  handleSave() {
    saveImage(this.encodedImageSource);
  }
}
