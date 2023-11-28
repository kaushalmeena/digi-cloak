import { Component } from '@angular/core';
import { SNACKBAR_TIMEOUT } from 'src/app/constants';
import { snackbarAnimations } from './snackbar.animation';

@Component({
  selector: 'app-snackbar',
  templateUrl: './snackbar.component.html',
  styleUrls: ['./snackbar.component.scss'],
  animations: [snackbarAnimations.snackbarState],
})
export class SnackbarComponent {
  visible = false;
  message = '';
  timeout: number | undefined;

  constructor() {}

  show(message: string) {
    clearTimeout(this.timeout);
    this.message = message;
    this.visible = true;
    this.timeout = window.setTimeout(() => this.hide(), SNACKBAR_TIMEOUT);
  }

  hide() {
    clearTimeout(this.timeout);
    this.visible = false;
  }
}
