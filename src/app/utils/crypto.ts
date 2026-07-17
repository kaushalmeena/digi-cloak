import AES from 'crypto-js/aes';
import Utf8 from 'crypto-js/enc-utf8';

/*
 * v2 payloads are produced with the Web Crypto API:
 * AES-256-GCM, key derived via PBKDF2-SHA-256.
 * Format: "v2$<base64 salt>$<base64 iv>$<base64 ciphertext>"
 *
 * Anything else is treated as a legacy crypto-js (OpenSSL EVP) payload
 * so images encoded by older versions of the app still decode.
 */
const V2_PREFIX = 'v2$';
const PBKDF2_ITERATIONS = 600_000;
const SALT_BYTES = 16;
const IV_BYTES = 12;
const GCM_TAG_BYTES = 16;

function toBase64(bytes: Uint8Array): string {
  let binary = '';
  for (const byte of bytes) {
    binary += String.fromCharCode(byte);
  }
  return btoa(binary);
}

function fromBase64(value: string): Uint8Array {
  const binary = atob(value);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

async function deriveKey(
  password: string,
  salt: Uint8Array
): Promise<CryptoKey> {
  const material = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(password),
    'PBKDF2',
    false,
    ['deriveKey']
  );
  return crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: salt as BufferSource,
      iterations: PBKDF2_ITERATIONS,
      hash: 'SHA-256',
    },
    material,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt']
  );
}

export async function encryptMessage(
  message: string,
  password: string
): Promise<string> {
  const salt = crypto.getRandomValues(new Uint8Array(SALT_BYTES));
  const iv = crypto.getRandomValues(new Uint8Array(IV_BYTES));
  const key = await deriveKey(password, salt);
  const ciphertext = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv: iv as BufferSource },
    key,
    new TextEncoder().encode(message)
  );
  return [
    'v2',
    toBase64(salt),
    toBase64(iv),
    toBase64(new Uint8Array(ciphertext)),
  ].join('$');
}

export async function decryptMessage(
  payload: string,
  password: string
): Promise<string> {
  if (!payload.startsWith(V2_PREFIX)) {
    return decryptLegacyMessage(payload, password);
  }

  const [, salt, iv, ciphertext] = payload.split('$');
  if (!salt || !iv || !ciphertext) {
    throw new Error('Message not found in the image');
  }

  try {
    const key = await deriveKey(password, fromBase64(salt));
    const plaintext = await crypto.subtle.decrypt(
      { name: 'AES-GCM', iv: fromBase64(iv) as BufferSource },
      key,
      fromBase64(ciphertext) as BufferSource
    );
    return new TextDecoder().decode(plaintext);
  } catch {
    throw new Error('Password is incorrect');
  }
}

function decryptLegacyMessage(payload: string, password: string): string {
  let result: string;
  try {
    result = AES.decrypt(payload, password).toString(Utf8);
  } catch {
    result = '';
  }
  if (!result) {
    throw new Error('Password is incorrect');
  }
  return result;
}

/** Length of the "v2$..." payload string for a message of the given UTF-8 byte length. */
export function encryptedPayloadLength(messageBytes: number): number {
  const base64 = (bytes: number) => 4 * Math.ceil(bytes / 3);
  return (
    2 + // "v2"
    3 + // "$" separators
    base64(SALT_BYTES) +
    base64(IV_BYTES) +
    base64(messageBytes + GCM_TAG_BYTES)
  );
}
