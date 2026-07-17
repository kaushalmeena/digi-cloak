import { TestBed } from '@angular/core/testing';

import { Theme } from './theme';

const DARK_MODE_CLASS = 'dark';

class FakeMediaQueryList {
  matches: boolean;
  private listeners: ((event: MediaQueryListEvent) => void)[] = [];

  constructor(matches: boolean) {
    this.matches = matches;
  }

  addEventListener(
    _type: string,
    listener: (event: MediaQueryListEvent) => void,
  ) {
    this.listeners.push(listener);
  }

  removeEventListener(
    _type: string,
    listener: (event: MediaQueryListEvent) => void,
  ) {
    this.listeners = this.listeners.filter((l) => l !== listener);
  }

  emit(matches: boolean) {
    this.matches = matches;
    const event = { matches } as MediaQueryListEvent;
    this.listeners.forEach((listener) => listener(event));
  }
}

describe('Theme', () => {
  let media: FakeMediaQueryList;

  function createService(systemPrefersDark: boolean): Theme {
    media = new FakeMediaQueryList(systemPrefersDark);
    spyOn(window, 'matchMedia').and.returnValue(
      media as unknown as MediaQueryList,
    );
    return TestBed.inject(Theme);
  }

  afterEach(() => {
    localStorage.removeItem('darkMode');
    document.body.classList.remove(DARK_MODE_CLASS);
  });

  it('should be created', () => {
    const service = createService(false);
    expect(service).toBeTruthy();
  });

  it('defaults to the system theme when no preference is stored', () => {
    const service = createService(true);
    expect(service.darkMode()).toBeTrue();
    expect(document.body.classList.contains(DARK_MODE_CLASS)).toBeTrue();
  });

  it('does not persist a preference for the system-derived initial value', () => {
    createService(true);
    expect(localStorage.getItem('darkMode')).toBeNull();
  });

  it('prefers an explicit stored preference over the system theme', () => {
    localStorage.setItem('darkMode', '0');
    const service = createService(true);
    expect(service.darkMode()).toBeFalse();
  });

  it('toggleDarkMode flips and persists the value', () => {
    const service = createService(false);
    service.toggleDarkMode();
    expect(localStorage.getItem('darkMode')).toBe('1');
    expect(service.darkMode()).toBeTrue();
    expect(document.body.classList.contains(DARK_MODE_CLASS)).toBeTrue();
  });

  it('setDarkMode(false) removes the dark class and persists it', () => {
    const service = createService(true);
    service.setDarkMode(false);
    expect(localStorage.getItem('darkMode')).toBe('0');
    expect(document.body.classList.contains(DARK_MODE_CLASS)).toBeFalse();
  });

  it('follows live system theme changes while no explicit preference is stored', () => {
    const service = createService(false);
    media.emit(true);
    expect(service.darkMode()).toBeTrue();
  });

  it('stops following system theme changes once the user sets an explicit preference', () => {
    const service = createService(false);
    service.toggleDarkMode();
    media.emit(false);
    expect(service.darkMode()).toBeTrue();
  });
});
