import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { DARK_MODE_CLASS } from './shared/constants';
import { ThemeService } from './shared/services/theme.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit, OnDestroy {
  themeSubscription!: Subscription;

  constructor(private themeService: ThemeService) {}

  ngOnInit(): void {
    this.themeSubscription = this.themeService
      .getDarkMode()
      .subscribe((mode) =>
        mode
          ? document.body.classList.add(DARK_MODE_CLASS)
          : document.body.classList.remove(DARK_MODE_CLASS)
      );
  }

  ngOnDestroy(): void {
    this.themeSubscription.unsubscribe();
  }
}
