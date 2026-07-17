import { Service } from '@angular/core';

import { getDecodedMessage, getEncodedBase64Image } from '../utils/stegano';
import type { SteganoRequest, SteganoResponse } from '../workers/messages';

interface PendingRequest {
  resolve: (result: string) => void;
  reject: (error: Error) => void;
}

/**
 * Runs steganography encode/decode off the main thread when Web Workers and
 * OffscreenCanvas are available, falling back to the main-thread canvas
 * implementation otherwise.
 */
@Service()
export class Stegano {
  private readonly worker = this.createWorker();
  private readonly pending = new Map<number, PendingRequest>();
  private nextId = 0;

  encode(image: string, message: string, password: string): Promise<string> {
    if (!this.worker) {
      return getEncodedBase64Image(image, message, password);
    }
    return this.request({ type: 'encode', image, message, password });
  }

  decode(image: string, password: string): Promise<string> {
    if (!this.worker) {
      return getDecodedMessage(image, password);
    }
    return this.request({ type: 'decode', image, password });
  }

  private request(payload: Omit<SteganoRequest, 'id'>): Promise<string> {
    const id = this.nextId++;
    return new Promise((resolve, reject) => {
      this.pending.set(id, { resolve, reject });
      this.worker?.postMessage({ ...payload, id });
    });
  }

  private createWorker(): Worker | null {
    if (
      typeof Worker === 'undefined' ||
      typeof OffscreenCanvas === 'undefined'
    ) {
      return null;
    }
    const worker = new Worker(
      new URL('../workers/stegano.worker', import.meta.url),
      { type: 'module' },
    );
    worker.onmessage = ({ data }: MessageEvent<SteganoResponse>) => {
      const pending = this.pending.get(data.id);
      if (!pending) {
        return;
      }
      this.pending.delete(data.id);
      if (data.ok) {
        pending.resolve(data.result ?? '');
      } else {
        pending.reject(new Error(data.error ?? 'Something went wrong'));
      }
    };
    return worker;
  }
}
