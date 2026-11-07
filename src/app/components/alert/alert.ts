import { ChangeDetectionStrategy, Component } from '@angular/core';

import { Icon } from '../icon/icon';

/** Inline error next to the action that caused it. */
@Component({
  selector: 'app-alert',
  imports: [Icon],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    role: 'alert',
    'data-testid': 'alert',
    class:
      'flex items-start gap-2.5 rounded-lg bg-destructive-soft px-3 py-2.5 text-sm text-destructive',
  },
  template: `
    <app-icon class="mt-0.5" name="alert" [size]="16" />
    <span><ng-content /></span>
  `,
})
export class Alert {}
