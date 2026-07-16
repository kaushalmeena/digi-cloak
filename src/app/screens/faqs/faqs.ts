import { Component, signal } from '@angular/core';

interface FaqAnswerBlock {
  heading?: string;
  text: string;
}

interface FaqEntry {
  question: string;
  answer: FaqAnswerBlock[];
}

const FAQ_ENTRIES: FaqEntry[] = [
  {
    question: 'What is Digi-Cloak?',
    answer: [
      {
        text: 'Digi-Cloak is an online web tool to hide a secret message in the image using cryptography and steganography.',
      },
    ],
  },
  {
    question: 'How does it work?',
    answer: [
      {
        heading: 'For locking:',
        text: 'You need to provide a message, password and image. Your message is encrypted into unreadable ciphertext using AES (Advanced Encryption Standard) encryption with the help of a password. Then ciphertext is hidden in the image using the LSB (Least Significant Bit) steganography technique in such a way that the image is unaffected.',
      },
      {
        heading: 'For unlocking:',
        text: 'You need to provide a password and image (in which the message is hidden). The hidden ciphertext is extracted from the image using the LSB steganography technique. Then ciphertext is decrypted into a readable message using an AES decryption with the help of a password.',
      },
    ],
  },
  {
    question: 'What information is retained?',
    answer: [
      {
        text: 'No information is retained, all operations happen at browser only.',
      },
    ],
  },
  {
    question: 'How secure is my message?',
    answer: [
      {
        text: 'Your message, password and image are never transmitted, all locking/unlocking takes place in your browser.',
      },
    ],
  },
  {
    question: 'I misplaced my password, is my message recoverable?',
    answer: [
      {
        text: 'No, that is the point. Your message, password and image are never submitted beyond your browser. If the password or image is misplaced, the original message is gone forever.',
      },
    ],
  },
  {
    question: 'Is there a limit to the length of message that can be hidden?',
    answer: [
      {
        text: 'Yes, message length should not be greater than 3 times the number of pixels (height x width) in the specified image.',
      },
    ],
  },
];

@Component({
  selector: 'app-faqs',
  imports: [],
  templateUrl: './faqs.html',
})
export class Faqs {
  protected readonly faqs = FAQ_ENTRIES;

  private readonly expanded = signal<ReadonlySet<number>>(new Set());

  protected isExpanded(index: number): boolean {
    return this.expanded().has(index);
  }

  protected toggle(index: number): void {
    this.expanded.update((current) => {
      const next = new Set(current);
      if (next.has(index)) {
        next.delete(index);
      } else {
        next.add(index);
      }
      return next;
    });
  }
}
