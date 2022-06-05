import { Component } from '@angular/core';
import { ThemeService } from 'app/shared/services/theme.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
})
export class HeaderComponent {
  themeSubscription!: Subscription;

  darkMode = false;
  repoUrl = 'https://github.com/kaushalmeena/digi-cloak';
  navItems = [
    { link: '/lock', title: 'Lock' },
    { link: '/unlock', title: 'Unlock' },
    { link: '/faqs', title: 'FAQs' },
  ];

  constructor(private themeService: ThemeService) {}

  ngOnInit(): void {
    this.themeSubscription = this.themeService
      .getDarkMode()
      .subscribe((mode) => (this.darkMode = mode));
  }

  ngOnDestroy(): void {
    this.themeSubscription.unsubscribe();
  }

  toggleDarkMode() {
    this.themeService.toggleDarkMode();
  }
}
