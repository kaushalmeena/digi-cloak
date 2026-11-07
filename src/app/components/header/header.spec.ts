import { signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterModule } from '@angular/router';

import { Pwa } from '../../services/pwa';
import { Theme } from '../../services/theme';
import { Header } from './header';

describe('Header', () => {
  let component: Header;
  let fixture: ComponentFixture<Header>;
  let darkMode: ReturnType<typeof signal<boolean>>;
  let themeSpy: { darkMode: typeof darkMode; toggleDarkMode: jasmine.Spy };
  let offline: ReturnType<typeof signal<boolean>>;
  let canInstall: ReturnType<typeof signal<boolean>>;
  let pwaSpy: {
    offline: typeof offline;
    canInstall: typeof canInstall;
    install: jasmine.Spy;
  };

  beforeEach(async () => {
    darkMode = signal(false);
    themeSpy = {
      darkMode,
      toggleDarkMode: jasmine.createSpy('toggleDarkMode'),
    };
    offline = signal(false);
    canInstall = signal(false);
    pwaSpy = {
      offline,
      canInstall,
      install: jasmine.createSpy('install').and.resolveTo(),
    };

    await TestBed.configureTestingModule({
      imports: [Header, RouterModule.forRoot([])],
      providers: [
        { provide: Theme, useValue: themeSpy },
        { provide: Pwa, useValue: pwaSpy },
      ],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(Header);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('links to the FAQ with an accessible help icon', () => {
    const link: HTMLAnchorElement = fixture.nativeElement.querySelector(
      'a[data-testid="nav-link"]',
    );
    expect(link.getAttribute('aria-label')).toBe('Help and FAQ');
    expect(link.getAttribute('href')).toBe('/faqs');
  });

  it('shows the offline badge only while offline', () => {
    const badge = (): Element | null =>
      fixture.nativeElement.querySelector('[data-testid="offline-badge"]');
    expect(badge()).toBeNull();

    offline.set(true);
    fixture.detectChanges();
    expect(badge()?.textContent).toContain('Offline');
  });

  it('offers install only when the browser allows it', () => {
    const button = (): HTMLButtonElement | null =>
      fixture.nativeElement.querySelector('[data-testid="install-button"]');
    expect(button()).toBeNull();

    canInstall.set(true);
    fixture.detectChanges();
    button()!.click();
    expect(pwaSpy.install).toHaveBeenCalled();
  });

  it('delegates toggleDarkMode to the Theme service', () => {
    const button = fixture.nativeElement.querySelector(
      '[data-testid="theme-toggle"]',
    );
    button.click();
    expect(themeSpy.toggleDarkMode).toHaveBeenCalled();
  });

  it('re-renders when the theme signal changes', () => {
    const toggle = (): HTMLElement =>
      fixture.nativeElement.querySelector('[data-testid="theme-toggle"]');
    expect(toggle().getAttribute('aria-label')).toBe('Switch to dark theme');

    darkMode.set(true);
    fixture.detectChanges();
    expect(toggle().getAttribute('aria-label')).toBe('Switch to light theme');
    expect(toggle().querySelectorAll('svg').length).toBe(1);
  });
});
