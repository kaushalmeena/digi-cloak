import { OnDestroy, Service, signal } from '@angular/core';

const DARK_MODE_CLASS = 'dark';
const DARK_MODE_STORAGE_KEY = 'darkMode';

function fetchStoredDarkMode(): boolean | null {
  const value = localStorage.getItem(DARK_MODE_STORAGE_KEY);
  return value === null ? null : value === '1';
}

function fetchSystemDarkMode(): boolean {
  return window.matchMedia('(prefers-color-scheme: dark)').matches;
}

function storeDarkMode(value: boolean): void {
  localStorage.setItem(DARK_MODE_STORAGE_KEY, value ? '1' : '0');
}

@Service()
export class Theme implements OnDestroy {
  private readonly media = window.matchMedia('(prefers-color-scheme: dark)');
  private readonly darkModeSignal = signal(
    fetchStoredDarkMode() ?? fetchSystemDarkMode(),
  );

  readonly darkMode = this.darkModeSignal.asReadonly();

  constructor() {
    this.setBodyClass(this.darkModeSignal());
    this.media.addEventListener('change', this.onSystemThemeChange);
  }

  ngOnDestroy(): void {
    this.media.removeEventListener('change', this.onSystemThemeChange);
  }

  private onSystemThemeChange = (event: MediaQueryListEvent): void => {
    if (fetchStoredDarkMode() === null) {
      this.darkModeSignal.set(event.matches);
      this.setBodyClass(event.matches);
    }
  };

  toggleDarkMode(): void {
    this.setDarkMode(!this.darkModeSignal());
  }

  setDarkMode(value: boolean): void {
    storeDarkMode(value);
    this.darkModeSignal.set(value);
    this.setBodyClass(value);
  }

  private setBodyClass(value: boolean): void {
    document.body.classList.toggle(DARK_MODE_CLASS, value);
  }
}
