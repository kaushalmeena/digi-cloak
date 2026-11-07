import { ChangeDetectionStrategy, Component, input } from '@angular/core';

/**
 * Animates its content's height and opacity open and closed (the 0fr/1fr grid
 * row technique), so content that comes and goes pushes neighbours smoothly
 * instead of making them jump. Closed content is inert.
 */
@Component({
  selector: 'app-collapse',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class:
      'grid transition-[grid-template-rows,opacity] duration-300 ease-out-expo motion-reduce:transition-none',
    '[style.grid-template-rows]': "open() ? '1fr' : '0fr'",
    '[style.opacity]': 'open() ? 1 : 0',
    '[inert]': '!open()',
  },
  template: `<div class="min-h-0 overflow-hidden"><ng-content /></div>`,
})
export class Collapse {
  readonly open = input(false);
}
