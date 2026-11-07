import {
  PASSWORD_ALPHABET,
  STRENGTH_LABELS,
  STRENGTH_THRESHOLDS,
} from '../constants';

/** 0 = weak, 1 = fair, 2 = good, 3 = strong */
export type StrengthLevel = 0 | 1 | 2 | 3;

export interface Strength {
  level: StrengthLevel;
  label: (typeof STRENGTH_LABELS)[number];
  /** Rough entropy estimate after penalties */
  bits: number;
}

const COMMON = [
  'password',
  'passw0rd',
  'qwerty',
  'letmein',
  'welcome',
  'admin',
  'iloveyou',
  'monkey',
  'dragon',
  'secret',
  'login',
  'abc123',
  '123456',
];
const SEQUENCES = [
  'abcdefghijklmnopqrstuvwxyz',
  '0123456789',
  'qwertyuiop',
  'asdfghjkl',
  'zxcvbnm',
];

function poolSize(value: string): number {
  let pool = 0;
  if (/[a-z]/.test(value)) pool += 26;
  if (/[A-Z]/.test(value)) pool += 26;
  if (/\d/.test(value)) pool += 10;
  if (/[^a-zA-Z0-9]/.test(value)) pool += 33;
  return pool;
}

/** Characters that sit inside a run like "abcd", "4321" or "qwer" count once. */
function predictableChars(lower: string): number {
  let count = 0;
  for (let i = 2; i < lower.length; i += 1) {
    const run = lower.slice(i - 2, i + 1);
    const reversed = [...run].reverse().join('');
    const isSequence = SEQUENCES.some(
      (seq) => seq.includes(run) || seq.includes(reversed),
    );
    const isRepeat = run[0] === run[1] && run[1] === run[2];
    if (isSequence || isRepeat) {
      count += 1;
    }
  }
  return count;
}

/**
 * A deliberately simple, dependency-free estimate: length times the bits per
 * character of the character pool, minus predictable runs and common words.
 * Good enough to steer people away from weak choices, not a cracking model.
 */
export function estimateStrength(value: string): Strength {
  if (!value) {
    return { level: 0, label: 'Weak', bits: 0 };
  }

  const lower = value.toLowerCase();
  const bitsPerChar = Math.log2(Math.max(poolSize(value), 1));
  const effectiveLength = Math.max(1, value.length - predictableChars(lower));
  let bits = effectiveLength * bitsPerChar;

  if (COMMON.some((word) => lower.includes(word))) {
    bits -= 24;
  }
  if (new Set(value).size <= 2) {
    bits = Math.min(bits, 10);
  }
  bits = Math.max(0, Math.round(bits));

  const index = STRENGTH_THRESHOLDS.findIndex((limit) => bits < limit);
  const level = (index === -1 ? 3 : index) as StrengthLevel;
  return { level, label: STRENGTH_LABELS[level], bits };
}

/** Uniform index below `max` from the CSPRNG, without modulo bias. */
function randomIndex(max: number): number {
  const limit = Math.floor(0x100000000 / max) * max;
  const buffer = new Uint32Array(1);
  do {
    crypto.getRandomValues(buffer);
  } while (buffer[0] >= limit);
  return buffer[0] % max;
}

/**
 * Four groups of five characters, e.g. "k7Qmz-Rt4wp-9HxcN-bv3Ke":
 * about 116 bits of entropy, and the dashes make it easy to read back.
 */
export function generatePassword(groups = 4, groupLength = 5): string {
  return Array.from({ length: groups }, () =>
    Array.from(
      { length: groupLength },
      () => PASSWORD_ALPHABET[randomIndex(PASSWORD_ALPHABET.length)],
    ).join(''),
  ).join('-');
}
