import { Component, OnInit } from '@angular/core';
import { fetchDarkMode } from 'src/utils';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  ngOnInit() {
    this.initThemeClass();
  }

  initThemeClass() {
    const value = fetchDarkMode();
    if (value) {
      document.body.classList.add("dark-mode");
    }
  }
}
