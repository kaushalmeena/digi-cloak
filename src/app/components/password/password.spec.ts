import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Password } from './password';

describe('Password', () => {
  let fixture: ComponentFixture<Password>;
  let element: HTMLElement;

  async function create(withStrength: boolean): Promise<void> {
    await TestBed.configureTestingModule({
      imports: [Password],
    }).compileComponents();

    fixture = TestBed.createComponent(Password);
    fixture.componentRef.setInput('inputId', 'password');
    fixture.componentRef.setInput('label', 'Password');
    fixture.componentRef.setInput('withStrength', withStrength);
    element = fixture.nativeElement;
    fixture.detectChanges();
  }

  function type(value: string): void {
    const input = element.querySelector<HTMLInputElement>('#password')!;
    input.value = value;
    input.dispatchEvent(new Event('input'));
    fixture.detectChanges();
  }

  it('masks the password by default and reveals it on toggle', async () => {
    await create(false);
    const input = element.querySelector<HTMLInputElement>('#password')!;
    expect(input.type).toBe('password');

    element.querySelector<HTMLButtonElement>('[data-testid="reveal-password"]')!.click();
    fixture.detectChanges();
    expect(input.type).toBe('text');
  });

  it('shows no strength meter when disabled', async () => {
    await create(false);
    type('short');
    expect(element.textContent).not.toContain('password');
  });

  it('rates a short password as weak and a complex one as strong', async () => {
    await create(true);

    type('abc');
    expect(element.textContent).toContain('Weak password');

    type('Correct-Horse-Battery-42');
    expect(element.textContent).toContain('Strong password');
  });
});
