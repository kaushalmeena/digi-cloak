import { Component, input, output } from '@angular/core';

@Component({
  selector: 'app-textbox',
  templateUrl: './textbox.html',
})
export class Textbox {
  readonly inputId = input.required<string>();
  readonly label = input.required<string>();
  readonly name = input('message');
  readonly rows = input(7);
  readonly readonly = input(false);
  readonly value = input('');
  readonly valueChange = output<string>();

  protected onInput(event: Event): void {
    this.valueChange.emit((event.target as HTMLTextAreaElement).value);
  }
}
