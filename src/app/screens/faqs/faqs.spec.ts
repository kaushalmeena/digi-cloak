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
    const entries = element.querySelectorAll('.faq');
    expect(entries.length).toBe(6);

    const toggles = element.querySelectorAll('.faq-toggle');
    toggles.forEach((toggle) => {
      expect(toggle.getAttribute('aria-expanded')).toBe('false');
    });
  });

  it('expands and collapses an entry when its question is clicked', () => {
    const toggle = element.querySelector<HTMLButtonElement>('.faq-toggle')!;
    const entry = element.querySelector('.faq')!;

    toggle.click();
    fixture.detectChanges();
    expect(toggle.getAttribute('aria-expanded')).toBe('true');
    expect(entry.classList.contains('expanded')).toBeTrue();

    toggle.click();
    fixture.detectChanges();
    expect(toggle.getAttribute('aria-expanded')).toBe('false');
    expect(entry.classList.contains('expanded')).toBeFalse();
  });

  it('allows multiple entries to be open at once', () => {
    const toggles =
      element.querySelectorAll<HTMLButtonElement>('.faq-toggle');

    toggles[0].click();
    toggles[1].click();
    fixture.detectChanges();

    const expanded = element.querySelectorAll('.faq.expanded');
    expect(expanded.length).toBe(2);
  });

  it('wires each toggle to its answer region for assistive technology', () => {
    const toggles = element.querySelectorAll<HTMLButtonElement>('.faq-toggle');
    toggles.forEach((toggle) => {
      const answerId = toggle.getAttribute('aria-controls')!;
      const answer = element.querySelector(`#${answerId}`);
      expect(answer).withContext(answerId).not.toBeNull();
      expect(answer?.getAttribute('role')).toBe('region');
      expect(answer?.getAttribute('aria-labelledby')).toBe(toggle.id);
    });
  });
});
