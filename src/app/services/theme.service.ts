import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { DARK_MODE_CLASS } from '../constants';
import { fetchDarkMode, storeDarkMode } from '../utils';

@Injectable({
  providedIn: 'root',
})
export class ThemeService {
  private darkMode = new BehaviorSubject<boolean>(fetchDarkMode());

  constructor() {
    this.initDarkMode();
  }

  private initDarkMode() {
    this.darkMode.subscribe((value) => this.setBodyClass(value));
  }

  private setBodyClass(value: boolean) {
    if (value) {
      document.body.classList.add(DARK_MODE_CLASS);
    } else {
      document.body.classList.remove(DARK_MODE_CLASS);
    }
    storeDarkMode(value);
  }

  toggleDarkMode() {
    this.setDarkMode(!this.darkMode.value);
  }

  setDarkMode(value: boolean) {
    this.darkMode.next(value);
  }

  getDarkMode() {
    return this.darkMode.asObservable();
  }
}
