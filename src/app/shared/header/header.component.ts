import { Component, OnInit } from '@angular/core';
import { fetchDarkMode, storeDarkMode } from 'src/utils';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit {
  darkMode = false

  constructor() { }

  ngOnInit(): void {
    this.darkMode = fetchDarkMode();
  }

  toogleDarkMode() {
    if (this.darkMode) {
      document.body.classList.remove("dark-mode");
      this.darkMode = false;
    } else {
      document.body.classList.add("dark-mode");
      this.darkMode = true;
    }
    storeDarkMode(this.darkMode);
  }

}
