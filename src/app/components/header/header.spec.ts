import { signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterModule } from '@angular/router';

import { Theme } from '../../services/theme';
import { Header } from './header';

describe('Header', () => {
  let component: Header;
  let fixture: ComponentFixture<Header>;
  let darkMode: ReturnType<typeof signal<boolean>>;
  let themeSpy: { darkMode: typeof darkMode; toggleDarkMode: jasmine.Spy };

  beforeEach(async () => {
    darkMode = signal(false);
    themeSpy = {
      darkMode,
      toggleDarkMode: jasmine.createSpy('toggleDarkMode'),
    };

    await TestBed.configureTestingModule({
      imports: [Header, RouterModule.forRoot([])],
      providers: [{ provide: Theme, useValue: themeSpy }],
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

  it('renders a nav link for each nav item', () => {
    const links: HTMLAnchorElement[] = Array.from(
      fixture.nativeElement.querySelectorAll('a[data-testid="nav-link"]'),
    );
    expect(links.map((link) => link.textContent?.trim())).toEqual(['FAQ']);
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
