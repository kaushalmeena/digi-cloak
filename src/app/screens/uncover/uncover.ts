import {
  afterNextRender,
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  inject,
  Injector,
  linkedSignal,
  signal,
  viewChild,
} from '@angular/core';

import { Alert } from '../../components/alert/alert';
import { Collapse } from '../../components/collapse/collapse';
import { Dropzone } from '../../components/dropzone/dropzone';
import { Icon } from '../../components/icon/icon';
import { Intro } from '../../components/intro/intro';
import { Loader } from '../../components/loader/loader';
import { Password } from '../../components/password/password';
import { Tabs } from '../../components/tabs/tabs';
import { Handoff } from '../../services/handoff';
import { Stegano } from '../../services/stegano';
import { copyText, getBase64ImageFromBlob } from '../../utils/browser';
import { COPIED_RESET_MS } from '../../constants';

/** Turns low-level decode errors into what happened and what to do next. */
export function describeDecodeError(message: string): string {
  if (message === 'Password is incorrect') {
    return 'Password is incorrect. Check it and try again.';
  }
  if (message === 'Message not found in the image') {
    return 'No hidden message found. The image may have been converted or compressed after the message was hidden.';
  }
  return message;
}

@Component({
  selector: 'app-uncover',
  imports: [Alert, Collapse, Dropzone, Icon, Intro, Loader, Password, Tabs],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './uncover.html',
})
export class Uncover {
  private readonly stegano = inject(Stegano);
  private readonly injector = inject(Injector);

  protected readonly previewImageSource = signal('');
  protected readonly decodedMessage = signal('');
  protected readonly busy = signal(false);
  protected readonly error = signal('');
  protected readonly copyError = signal('');
  protected readonly copied = signal(false);
  /** Keep the last text while an alert collapses away. */
  protected readonly visibleError = linkedSignal<string, string>({
    source: this.error,
    computation: (error, previous) => error || previous?.value || '',
  });
  protected readonly visibleCopyError = linkedSignal<string, string>({
    source: this.copyError,
    computation: (error, previous) => error || previous?.value || '',
  });

  private readonly result = viewChild<ElementRef<HTMLElement>>('result');
  private readonly dropzone = viewChild.required(Dropzone);
  /** The chosen image has no Digi-Cloak message in it at all. */
  protected readonly noMessageFound = signal(false);
  private currentFile: File | null = null;
  private copiedTimeout: number | undefined;

  constructor() {
    inject(DestroyRef).onDestroy(() => clearTimeout(this.copiedTimeout));

    // An image handed over from Conceal ("Uncover it instead") is pre-selected.
    const handed = inject(Handoff).take();
    if (handed) {
      afterNextRender(() => this.dropzone().select(handed));
    }
  }

  protected handleFile(file: File | null): void {
    this.resetResult();
    this.previewImageSource.set('');
    this.noMessageFound.set(false);
    this.currentFile = file;
    if (!file) {
      return;
    }

    getBase64ImageFromBlob(file)
      .then(async (src) => {
        this.previewImageSource.set(src);
        const found = await this.stegano.detect(src).catch(() => true);
        // Ignore the answer if another image was chosen meanwhile.
        if (this.currentFile === file) {
          this.noMessageFound.set(!found);
        }
      })
      .catch(() => {
        this.error.set("That file couldn't be read as an image.");
      });
  }

  protected handlePasswordInput(): void {
    this.resetResult();
  }

  protected handleSubmit(event: Event): void {
    event.preventDefault();

    if (!this.previewImageSource()) {
      this.error.set('Choose the image that holds the message.');
      return;
    }

    const target = event.target as HTMLFormElement;
    const password = target['password'].value as string;

    this.resetResult();
    this.busy.set(true);
    this.stegano
      .decode(this.previewImageSource(), password)
      .then((msg) => {
        this.decodedMessage.set(msg);
        this.revealResult();
      })
      .catch((err: Error) => {
        this.error.set(describeDecodeError(err.message));
      })
      .finally(() => {
        this.busy.set(false);
      });
  }

  protected handleCopy(): void {
    this.copyError.set('');
    copyText(this.decodedMessage())
      .then(() => {
        this.copied.set(true);
        clearTimeout(this.copiedTimeout);
        this.copiedTimeout = window.setTimeout(
          () => this.copied.set(false),
          COPIED_RESET_MS,
        );
      })
      .catch((err: Error) => {
        this.copyError.set(`Couldn't copy: ${err.message}`);
      });
  }

  private resetResult(): void {
    this.decodedMessage.set('');
    this.error.set('');
    this.copyError.set('');
    this.copied.set(false);
  }

  private revealResult(): void {
    afterNextRender(
      () => {
        const reduce = window.matchMedia(
          '(prefers-reduced-motion: reduce)',
        ).matches;
        this.result()?.nativeElement.scrollIntoView({
          behavior: reduce ? 'auto' : 'smooth',
          block: 'nearest',
        });
      },
      { injector: this.injector },
    );
  }
}
