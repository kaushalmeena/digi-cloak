import { Component } from '@angular/core';
import { ThemeService } from 'src/app/services/theme.service';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
})
export class HeaderComponent {
  darkMode$: Observable<boolean>;

  repoUrl = 'https://github.com/kaushalmeena/digi-cloak';
  navItems = [
    { link: '/lock', title: 'Lock' },
    { link: '/unlock', title: 'Unlock' },
    { link: '/faqs', title: 'FAQs' },
  ];

  constructor(private themeService: ThemeService) {
    this.darkMode$ = this.themeService.getDarkMode();
  }

  toggleDarkMode() {
    this.themeService.toggleDarkMode();
  }
}
