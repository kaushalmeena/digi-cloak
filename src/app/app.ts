import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

import { Header } from './components/header/header';
import { Icon } from './components/icon/icon';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, Header, Icon],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'flex min-h-dvh flex-col' },
  template: `
    <app-header />
    <main class="mx-auto w-full max-w-5xl flex-1 px-4 pt-8 pb-16 sm:pt-12">
      <router-outlet />
    </main>
    <footer class="border-t border-border">
      <p
        class="mx-auto flex w-full max-w-5xl items-center gap-2 px-4 py-5 text-xs text-muted-foreground"
      >
        <app-icon name="shield" [size]="14" />
        Runs entirely in your browser. Images, messages and passwords never
        leave your device.
      </p>
    </footer>
  `,
})
export class App {}
