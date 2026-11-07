import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';

import { Theme } from '../../services/theme';
import { Icon } from '../icon/icon';

@Component({
  selector: 'app-header',
  imports: [RouterLink, RouterLinkActive, Icon],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './header.html',
})
export class Header {
  private readonly theme = inject(Theme);

  protected readonly darkMode = this.theme.darkMode;
  protected readonly repoUrl = 'https://github.com/kaushalmeena/digi-cloak';
  protected readonly navItems = [{ link: '/faqs', title: 'FAQ' }];

  toggleDarkMode(): void {
    this.theme.toggleDarkMode();
  }
}
