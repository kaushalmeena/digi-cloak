import { signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { App } from './app';
import { Pwa } from './services/pwa';

describe('App', () => {
  let fixture: ComponentFixture<App>;
  const updateReady = signal(false);

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [App],
      providers: [
        provideRouter([]),
        {
          provide: Pwa,
          useValue: {
            offline: signal(false),
            canInstall: signal(false),
            updateReady: updateReady,
            applyUpdate: jasmine.createSpy('applyUpdate').and.resolveTo(),
            dismissUpdate: () => updateReady.set(false),
          },
        },
      ],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(App);
    fixture.detectChanges();
  });

  it('should create the app', () => {
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('renders the header', () => {
    expect(fixture.nativeElement.querySelector('app-header')).not.toBeNull();
  });

  it('offers a reload when a new version is ready', () => {
    const notice = (): Element | null =>
      fixture.nativeElement.querySelector('[data-testid="update-notice"]');
    expect(notice()).toBeNull();

    updateReady.set(true);
    fixture.detectChanges();
    expect(notice()?.textContent).toContain('A new version is ready');
    updateReady.set(false);
  });
});
