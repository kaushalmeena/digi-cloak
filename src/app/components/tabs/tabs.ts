import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';

import { Icon, IconName } from '../icon/icon';

interface ModeTab {
  link: string;
  title: string;
  icon: IconName;
}

/** Segmented switch between the two tool modes; each mode keeps its own URL. */
@Component({
  selector: 'app-tabs',
  imports: [RouterLink, RouterLinkActive, Icon],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'block' },
  template: `
    <nav
      aria-label="Mode"
      class="grid grid-cols-2 gap-1 rounded-lg border border-border bg-muted p-1"
    >
      @for (tab of tabs; track tab.link) {
        <a
          data-testid="mode-tab"
          class="flex h-9 items-center justify-center gap-2 rounded-md text-sm font-medium text-muted-foreground transition-colors duration-150 hover:text-foreground"
          [routerLink]="tab.link"
          routerLinkActive="bg-card text-foreground! shadow-[0_1px_2px_rgb(16_22_26/0.08)]"
          ariaCurrentWhenActive="page"
        >
          <app-icon [name]="tab.icon" [size]="15" />
          {{ tab.title }}
        </a>
      }
    </nav>
  `,
})
export class Tabs {
  protected readonly tabs: ModeTab[] = [
    { link: '/conceal', title: 'Conceal', icon: 'lock' },
    { link: '/uncover', title: 'Uncover', icon: 'unlock' },
  ];
}
