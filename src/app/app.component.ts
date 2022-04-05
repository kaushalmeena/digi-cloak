import { Component } from '@angular/core';
import { DARK_MODE_CLASS } from './shared/constants';
import { ThemeService } from './shared/services/theme.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent {
  constructor(private themeService: ThemeService) {
    this.themeService
      .getDarkMode()
      .subscribe((mode) =>
        mode
          ? document.body.classList.add(DARK_MODE_CLASS)
          : document.body.classList.remove(DARK_MODE_CLASS)
      );
  }
}
