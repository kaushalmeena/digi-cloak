import { Component, ViewChild } from '@angular/core';
import { SnackbarComponent } from 'src/app/components/snackbar/snackbar.component';
import { copyText, getBase64ImageFromBlob, getDecodedMessage } from 'src/app/utils';

@Component({
  selector: 'app-unlock',
  templateUrl: './unlock.component.html',
  styleUrls: ['./unlock.component.scss'],
})
export class UnlockComponent {
  previewImageSource = '';
  decodedMessage = '';
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
    const password = target['password'].value as string;

    getDecodedMessage(this.previewImageSource, password)
      .then((msg) => {
        this.decodedMessage = msg;
        this.isOutputVisible = true;
      })
      .catch((err) => {
        this.snackbar.show(err.message);
      });
  }

  handleCopy() {
    copyText(this.decodedMessage)
      .then(() => {
        this.snackbar.show('Copied to clipboard');
      })
      .catch((err) => {
        this.snackbar.show(err.message);
      });
  }
}
