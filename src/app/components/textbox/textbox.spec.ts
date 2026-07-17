import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Textbox } from './textbox';

describe('Textbox', () => {
  let fixture: ComponentFixture<Textbox>;
  let element: HTMLElement;

  async function create(readonly: boolean): Promise<void> {
    await TestBed.configureTestingModule({
      imports: [Textbox],
    }).compileComponents();

    fixture = TestBed.createComponent(Textbox);
    fixture.componentRef.setInput('inputId', 'message');
    fixture.componentRef.setInput('label', 'Message');
    fixture.componentRef.setInput('readonly', readonly);
    element = fixture.nativeElement;
    fixture.detectChanges();
  }

  it('renders the label wired to the textarea', async () => {
    await create(false);
    const label = element.querySelector('label')!;
    expect(label.textContent).toBe('Message');
    expect(label.getAttribute('for')).toBe('message');
    expect(element.querySelector('textarea#message')).not.toBeNull();
  });

  it('emits valueChange as the user types', async () => {
    await create(false);
    const received: string[] = [];
    fixture.componentInstance.valueChange.subscribe((value) =>
      received.push(value)
    );

    const textarea = element.querySelector<HTMLTextAreaElement>('textarea')!;
    textarea.value = 'hello';
    textarea.dispatchEvent(new Event('input'));

    expect(received).toEqual(['hello']);
  });

  it('is required when editable and read-only otherwise', async () => {
    await create(false);
    const textarea = element.querySelector<HTMLTextAreaElement>('textarea')!;
    expect(textarea.required).toBeTrue();
    expect(textarea.readOnly).toBeFalse();

    fixture.componentRef.setInput('readonly', true);
    fixture.detectChanges();
    expect(textarea.required).toBeFalse();
    expect(textarea.readOnly).toBeTrue();
  });

  it('reflects the bound value', async () => {
    await create(true);
    fixture.componentRef.setInput('value', 'decoded text');
    fixture.detectChanges();

    expect(
      element.querySelector<HTMLTextAreaElement>('textarea')!.value
    ).toBe('decoded text');
  });
});
