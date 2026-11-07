import {
  ChangeDetectionStrategy,
  Component,
  input,
  output,
} from '@angular/core';

@Component({
  selector: 'app-textbox',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'block' },
  templateUrl: './textbox.html',
})
export class Textbox {
  readonly inputId = input.required<string>();
  readonly label = input.required<string>();
  readonly name = input('message');
  readonly placeholder = input('');
  readonly rows = input(5);
  readonly readonly = input(false);
  readonly monospace = input(false);
  readonly value = input('');
  readonly valueChange = output<string>();

  protected onInput(event: Event): void {
    this.valueChange.emit((event.target as HTMLTextAreaElement).value);
  }
}
