import { DestroyRef, inject, Service, signal } from '@angular/core';
import { SwUpdate, VersionReadyEvent } from '@angular/service-worker';
import { filter } from 'rxjs';

/** The non-standard event Chromium fires when the app can be installed. */
interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

/**
 * App-level state for the installable, offline-capable build: whether it can
 * be installed, whether the device is offline, and whether a newer version
 * has been downloaded and is waiting for a reload.
 */
@Service()
export class Pwa {
  private readonly swUpdate = inject(SwUpdate);
  private installEvent: BeforeInstallPromptEvent | null = null;

  private readonly canInstallSignal = signal(false);
  private readonly offlineSignal = signal(!navigator.onLine);
  private readonly updateReadySignal = signal(false);

  readonly canInstall = this.canInstallSignal.asReadonly();
  readonly offline = this.offlineSignal.asReadonly();
  readonly updateReady = this.updateReadySignal.asReadonly();

  constructor() {
    window.addEventListener('beforeinstallprompt', this.onBeforeInstall);
    window.addEventListener('appinstalled', this.onInstalled);
    window.addEventListener('online', this.onOnline);
    window.addEventListener('offline', this.onOffline);

    if (this.swUpdate.isEnabled) {
      const subscription = this.swUpdate.versionUpdates
        .pipe(filter((e): e is VersionReadyEvent => e.type === 'VERSION_READY'))
        .subscribe(() => this.updateReadySignal.set(true));
      inject(DestroyRef).onDestroy(() => subscription.unsubscribe());
    }

    inject(DestroyRef).onDestroy(() => {
      window.removeEventListener('beforeinstallprompt', this.onBeforeInstall);
      window.removeEventListener('appinstalled', this.onInstalled);
      window.removeEventListener('online', this.onOnline);
      window.removeEventListener('offline', this.onOffline);
    });
  }

  async install(): Promise<void> {
    const event = this.installEvent;
    if (!event) {
      return;
    }
    await event.prompt();
    const { outcome } = await event.userChoice;
    if (outcome === 'accepted') {
      this.onInstalled();
    }
  }

  async applyUpdate(): Promise<void> {
    await this.swUpdate.activateUpdate();
    document.location.reload();
  }

  dismissUpdate(): void {
    this.updateReadySignal.set(false);
  }

  private onBeforeInstall = (event: Event): void => {
    // Keep the browser's mini-infobar quiet; we offer install from the header.
    event.preventDefault();
    this.installEvent = event as BeforeInstallPromptEvent;
    this.canInstallSignal.set(true);
  };

  private onInstalled = (): void => {
    this.installEvent = null;
    this.canInstallSignal.set(false);
  };

  private onOnline = (): void => this.offlineSignal.set(false);
  private onOffline = (): void => this.offlineSignal.set(true);
}
