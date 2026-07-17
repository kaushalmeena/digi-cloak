import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SNACKBAR_TIMEOUT, Snackbar } from './snackbar';

describe('Snackbar', () => {
  let component: Snackbar;
  let fixture: ComponentFixture<Snackbar>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Snackbar],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(Snackbar);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterEach(() => {
    jasmine.clock().uninstall();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('is hidden with no message by default', () => {
    expect(component.visible()).toBeFalse();
    expect(component.message()).toBe('');
  });

  it('show() makes the snackbar visible with the given message', () => {
    component.show('Something happened');
    expect(component.visible()).toBeTrue();
    expect(component.message()).toBe('Something happened');
  });

  it('hide() hides the snackbar', () => {
    component.show('Something happened');
    component.hide();
    expect(component.visible()).toBeFalse();
  });

  it('auto-hides after SNACKBAR_TIMEOUT', () => {
    jasmine.clock().install();
    component.show('Something happened');
    expect(component.visible()).toBeTrue();

    jasmine.clock().tick(SNACKBAR_TIMEOUT - 1);
    expect(component.visible()).toBeTrue();

    jasmine.clock().tick(1);
    expect(component.visible()).toBeFalse();
  });

  it('calling show() again resets the auto-hide timer', () => {
    jasmine.clock().install();
    component.show('First message');
    jasmine.clock().tick(SNACKBAR_TIMEOUT - 1);

    component.show('Second message');
    jasmine.clock().tick(SNACKBAR_TIMEOUT - 1);
    expect(component.visible()).toBeTrue();
    expect(component.message()).toBe('Second message');

    jasmine.clock().tick(1);
    expect(component.visible()).toBeFalse();
  });

  it('the close button hides the snackbar', () => {
    component.show('Something happened');
    fixture.detectChanges();

    const closeButton = fixture.nativeElement.querySelector(
      '[data-testid="snackbar-close"]',
    );
    closeButton.click();

    expect(component.visible()).toBeFalse();
  });
});
