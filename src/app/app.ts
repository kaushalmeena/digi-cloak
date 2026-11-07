import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterLink, RouterOutlet } from '@angular/router';

import { Header } from './components/header/header';
import { Icon } from './components/icon/icon';
import { Pwa } from './services/pwa';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, RouterLink, Header, Icon],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'flex min-h-dvh flex-col' },
  template: `
    <app-header />
    <main class="mx-auto w-full max-w-5xl flex-1 px-4 pt-8 pb-16 sm:pt-12">
      <router-outlet />
    </main>
    <footer class="border-t border-border">
      <div
        class="mx-auto flex w-full max-w-5xl flex-col gap-3 px-4 py-5 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between"
      >
        <p class="flex items-center gap-2">
          <app-icon name="shield" [size]="14" />
          Runs entirely in your browser. Images, messages and passwords never
          leave your device.
        </p>
        <nav aria-label="Footer" class="flex items-center gap-4">
          <a
            data-testid="footer-link"
            class="underline-offset-4 transition-colors duration-150 hover:text-foreground hover:underline"
            routerLink="/faqs"
            >FAQ</a
          >
          <a
            data-testid="footer-link"
            class="underline-offset-4 transition-colors duration-150 hover:text-foreground hover:underline"
            [href]="repoUrl"
            >Source code</a
          >
        </nav>
      </div>
    </footer>

    @if (updateReady()) {
      <div
        data-testid="update-notice"
        role="status"
        class="panel fixed inset-x-4 bottom-4 z-20 flex items-center gap-3 py-2.5 pr-2.5 pl-4 text-sm shadow-lg sm:left-auto sm:w-96"
        animate.enter="animate-fade-in motion-reduce:animate-none"
        animate.leave="animate-fade-out motion-reduce:animate-none"
      >
        <app-icon class="text-primary" name="refresh" [size]="16" />
        <span class="flex-1">A new version is ready.</span>
        <button
          type="button"
          class="btn btn-ghost min-h-8 px-2.5"
          (click)="handleDismissUpdate()"
        >
          Later
        </button>
        <button
          type="button"
          class="btn btn-primary min-h-8 px-3"
          (click)="handleApplyUpdate()"
        >
          Reload
        </button>
      </div>
    }
  `,
})
export class App {
  private readonly pwa = inject(Pwa);

  protected readonly updateReady = this.pwa.updateReady;
  protected readonly repoUrl = 'https://github.com/kaushalmeena/digi-cloak';

  protected handleApplyUpdate(): void {
    void this.pwa.applyUpdate();
  }

  protected handleDismissUpdate(): void {
    this.pwa.dismissUpdate();
  }
}
