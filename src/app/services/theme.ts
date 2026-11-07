import { OnDestroy, Service, signal } from '@angular/core';

const DARK_MODE_CLASS = 'dark';
const DARK_MODE_STORAGE_KEY = 'darkMode';
const SWITCHING_CLASS = 'theme-switching';

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
    const root = document.documentElement;
    // Suspend transitions so all colours change in the same frame; otherwise
    // elements with transition-colors visibly lag behind the rest.
    root.classList.add(SWITCHING_CLASS);
    document.body.classList.toggle(DARK_MODE_CLASS, value);
    // Force a style flush while transitions are off, then restore them.
    void root.offsetHeight;
    root.classList.remove(SWITCHING_CLASS);
  }
}
