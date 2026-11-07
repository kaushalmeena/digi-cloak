import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { Tabs } from './tabs';

describe('Tabs', () => {
  it('links to both tool modes', async () => {
    await TestBed.configureTestingModule({
      imports: [Tabs],
      providers: [provideRouter([])],
    }).compileComponents();

    const fixture = TestBed.createComponent(Tabs);
    fixture.detectChanges();

    const tabs: HTMLAnchorElement[] = Array.from(
      fixture.nativeElement.querySelectorAll('[data-testid="mode-tab"]'),
    );
    expect(tabs.map((tab) => tab.textContent?.trim())).toEqual([
      'Hide',
      'Reveal',
    ]);
    expect(tabs.map((tab) => tab.getAttribute('href'))).toEqual([
      '/lock',
      '/unlock',
    ]);
  });
});
