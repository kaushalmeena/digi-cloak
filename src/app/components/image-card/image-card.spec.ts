import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ImageCard } from './image-card';

@Component({
  imports: [ImageCard],
  template: `<app-image-card label="Test Label" [source]="source" alt="Test-Image" />`,
})
class Host {
  source = '';
}

describe('ImageCard', () => {
  let fixture: ComponentFixture<Host>;
  let host: Host;
  let element: HTMLElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Host],
    }).compileComponents();

    fixture = TestBed.createComponent(Host);
    host = fixture.componentInstance;
    element = fixture.nativeElement;
    fixture.detectChanges();
  });

  it('renders the label', () => {
    expect(element.querySelector('.card-label')?.textContent).toBe(
      'Test Label'
    );
  });

  it('shows a placeholder icon when there is no image source', () => {
    expect(element.querySelector('.card-media svg')).not.toBeNull();
    expect(element.querySelector('.card-media img')).toBeNull();
  });

  it('shows the image once a source is set', () => {
    host.source = 'data:image/png;base64,abc123';
    fixture.detectChanges();

    const img = element.querySelector<HTMLImageElement>('.card-media img');
    expect(img).not.toBeNull();
    expect(img?.alt).toBe('Test-Image');
    expect(element.querySelector('.card-media svg')).toBeNull();
  });
});
