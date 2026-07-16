import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

import { Header } from './components/header/header';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, Header],
  template: `
    <app-header />
    <main
      class="box-border mx-auto px-4 pt-[30px] pb-[60px] min-h-[calc(100vh-60px)] w-3/4 max-[720px]:w-full"
    >
      <router-outlet />
    </main>
  `,
})
export class App {}
