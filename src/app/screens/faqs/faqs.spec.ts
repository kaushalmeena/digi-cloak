import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Faqs } from './faqs';

describe('Faqs', () => {
  let component: Faqs;
  let fixture: ComponentFixture<Faqs>;
  let element: HTMLElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Faqs],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(Faqs);
    component = fixture.componentInstance;
    element = fixture.nativeElement;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('renders all FAQ entries collapsed by default', () => {
    const entries = element.querySelectorAll('[data-testid="faq"]');
    expect(entries.length).toBe(7);

    const toggles = element.querySelectorAll('[data-testid="faq-toggle"]');
    toggles.forEach((toggle) => {
      expect(toggle.getAttribute('aria-expanded')).toBe('false');
    });
  });

  it('expands and collapses an entry when its question is clicked', () => {
    const toggle = element.querySelector<HTMLButtonElement>(
      '[data-testid="faq-toggle"]',
    )!;
    const entry = element.querySelector('[data-testid="faq"]')!;

    toggle.click();
    fixture.detectChanges();
    expect(toggle.getAttribute('aria-expanded')).toBe('true');
    expect(entry.getAttribute('data-expanded')).toBe('true');

    toggle.click();
    fixture.detectChanges();
    expect(toggle.getAttribute('aria-expanded')).toBe('false');
    expect(entry.getAttribute('data-expanded')).toBe('false');
  });

  it('allows multiple entries to be open at once', () => {
    const toggles = element.querySelectorAll<HTMLButtonElement>(
      '[data-testid="faq-toggle"]',
    );

    toggles[0].click();
    toggles[1].click();
    fixture.detectChanges();

    const expanded = element.querySelectorAll(
      '[data-testid="faq"][data-expanded="true"]',
    );
    expect(expanded.length).toBe(2);
  });

  it('wires each toggle to its answer region for assistive technology', () => {
    const toggles = element.querySelectorAll<HTMLButtonElement>(
      '[data-testid="faq-toggle"]',
    );
    toggles.forEach((toggle) => {
      const answerId = toggle.getAttribute('aria-controls')!;
      const answer = element.querySelector(`#${answerId}`);
      expect(answer).withContext(answerId).not.toBeNull();
      expect(answer?.getAttribute('role')).toBe('region');
      expect(answer?.getAttribute('aria-labelledby')).toBe(toggle.id);
    });
  });
});
