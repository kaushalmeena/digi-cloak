import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';

import { Pwa } from '../../services/pwa';
import { Theme } from '../../services/theme';
import { Icon } from '../icon/icon';

@Component({
  selector: 'app-header',
  imports: [RouterLink, RouterLinkActive, Icon],
  changeDetection: ChangeDetectionStrategy.OnPush,
  // Sticky on the host: the inner <header> is only as tall as itself, so it
  // would have no room to stick within.
  host: { class: 'sticky top-0 z-10 block' },
  templateUrl: './header.html',
})
export class Header {
  private readonly theme = inject(Theme);
  private readonly pwa = inject(Pwa);

  protected readonly darkMode = this.theme.darkMode;
  protected readonly offline = this.pwa.offline;
  protected readonly canInstall = this.pwa.canInstall;
  protected readonly repoUrl = 'https://github.com/kaushalmeena/digi-cloak';

  toggleDarkMode(): void {
    this.theme.toggleDarkMode();
  }

  protected handleInstall(): void {
    void this.pwa.install();
  }
}
