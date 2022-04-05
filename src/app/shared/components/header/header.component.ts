import { Component } from '@angular/core';
import { ThemeService } from 'app/shared/services/theme.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent {
  repoUrl = 'https://github.com/kaushalmeena/digi-cloak';

  navItems = [
    { link: '/lock', title: 'Lock' },
    { link: '/unlock', title: 'Unlock' },
    { link: '/faqs', title: 'FAQs' }
  ];

  darkMode = false

  constructor(private themeService: ThemeService) {
    this.themeService.getDarkMode().subscribe((mode) => this.darkMode = mode)
  }

  toogleDarkMode() {
   this.themeService.toogleDarkMode();
  }
}
