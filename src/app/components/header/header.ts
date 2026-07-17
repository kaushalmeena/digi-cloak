import { Component, inject, signal } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';

import { Theme } from '../../services/theme';

@Component({
  selector: 'app-header',
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './header.html',
})
export class Header {
  private readonly theme = inject(Theme);

  protected readonly darkMode = this.theme.darkMode;
  protected readonly menuOpen = signal(false);
  protected readonly repoUrl = 'https://github.com/kaushalmeena/digi-cloak';
  protected readonly navItems = [
    { link: '/lock', title: 'Lock' },
    { link: '/unlock', title: 'Unlock' },
    { link: '/faqs', title: 'FAQs' },
  ];

  toggleDarkMode(): void {
    this.theme.toggleDarkMode();
  }

  toggleMenu(): void {
    this.menuOpen.update((open) => !open);
  }

  closeMenu(): void {
    this.menuOpen.set(false);
  }
}
