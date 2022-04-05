import { Injectable } from '@angular/core';
import { Observable, BehaviorSubject } from 'rxjs';
import { fetchDarkMode, storeDarkMode } from '../utils';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  private darkMode: BehaviorSubject<boolean>;

  constructor() {
    this.darkMode = new BehaviorSubject<boolean>(fetchDarkMode());
  }

  toogleDarkMode() {
    this.setDarkMode(!this.darkMode.getValue());
  }

  setDarkMode(mode: boolean) {
    this.darkMode.next(mode);
    storeDarkMode(mode);
  }

  getDarkMode(): Observable<boolean> {
    return this.darkMode;
  }
}