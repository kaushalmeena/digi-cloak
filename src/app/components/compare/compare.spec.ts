import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Compare } from './compare';

describe('Compare', () => {
  let fixture: ComponentFixture<Compare>;
  let element: HTMLElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Compare],
    }).compileComponents();

    fixture = TestBed.createComponent(Compare);
    fixture.componentRef.setInput('before', 'data:image/png;base64,before');
    fixture.componentRef.setInput('after', 'data:image/png;base64,after');
    element = fixture.nativeElement;
    fixture.detectChanges();
  });

  it('renders both images', () => {
    expect(element.querySelector('img[alt="Original image"]')).not.toBeNull();
    expect(element.querySelector('img[alt="Encoded image"]')).not.toBeNull();
  });

  it('clips the encoded image according to the slider position', () => {
    const slider = element.querySelector<HTMLInputElement>(
      'input[type="range"]',
    )!;
    slider.value = '75';
    slider.dispatchEvent(new Event('input'));
    fixture.detectChanges();

    const after = element.querySelector<HTMLImageElement>(
      'img[alt="Encoded image"]',
    )!;
    expect(after.style.clipPath).toBe('inset(0px 0px 0px 75%)');
  });
});
