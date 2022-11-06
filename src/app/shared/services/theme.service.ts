import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { tap } from 'rxjs/operators';
import { DARK_MODE_CLASS } from '../constants';
import { fetchDarkMode, storeDarkMode } from '../utils';

@Injectable({
  providedIn: 'root',
})
export class ThemeService {
  private darkMode: BehaviorSubject<boolean>;

  constructor() {
    this.darkMode = new BehaviorSubject(fetchDarkMode());
  }

  private onNext(value: boolean) {
    if (value) {
      document.body.classList.add(DARK_MODE_CLASS);
    } else {
      document.body.classList.remove(DARK_MODE_CLASS);
    }
    storeDarkMode(value);
  }

  toggleDarkMode() {
    this.setDarkMode(!this.darkMode.getValue());
  }

  setDarkMode(value: boolean) {
    this.darkMode.next(value);
  }

  getDarkMode() {
    return this.darkMode.pipe(
      tap({
        next: this.onNext,
      })
    );
  }
}
