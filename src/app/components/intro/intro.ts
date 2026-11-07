import { ChangeDetectionStrategy, Component, input } from '@angular/core';

/** Page title and one-line explanation shared by the tool screens. */
@Component({
  selector: 'app-intro',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'block' },
  template: `
    <h1 class="text-2xl font-semibold tracking-tight text-balance">
      {{ title() }}
    </h1>
    <p class="mt-1.5 text-[15px] text-pretty text-muted-foreground">
      {{ description() }}
    </p>
  `,
})
export class Intro {
  readonly title = input.required<string>();
  readonly description = input.required<string>();
}
