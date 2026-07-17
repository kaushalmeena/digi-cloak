import AES from 'crypto-js/aes';

import {
  decryptMessage,
  encryptMessage,
  encryptedPayloadLength,
} from './crypto';

describe('crypto utils', () => {
  it('round-trips a message through the v2 format', async () => {
    const payload = await encryptMessage('secret message', 'my-password');
    expect(payload).toMatch(/^v2\$/);
    expect(await decryptMessage(payload, 'my-password')).toBe('secret message');
  });

  it('produces a fresh payload per encryption (random salt/iv)', async () => {
    const first = await encryptMessage('same message', 'same-password');
    const second = await encryptMessage('same message', 'same-password');
    expect(first).not.toBe(second);
  });

  it('rejects a v2 payload with the wrong password', async () => {
    const payload = await encryptMessage('secret message', 'my-password');
    await expectAsync(
      decryptMessage(payload, 'wrong-password'),
    ).toBeRejectedWithError('Password is incorrect');
  });

  it('decrypts legacy crypto-js payloads', async () => {
    const legacy = AES.encrypt('legacy message', 'my-password').toString();
    expect(await decryptMessage(legacy, 'my-password')).toBe('legacy message');
  });

  it('rejects a legacy payload with the wrong password', async () => {
    const legacy = AES.encrypt('legacy message', 'my-password').toString();
    await expectAsync(
      decryptMessage(legacy, 'wrong-password'),
    ).toBeRejectedWithError('Password is incorrect');
  });

  it('predicts the exact v2 payload length', async () => {
    const message = 'hello world';
    const payload = await encryptMessage(message, 'pw');
    expect(payload.length).toBe(
      encryptedPayloadLength(new TextEncoder().encode(message).length),
    );
  });
});
