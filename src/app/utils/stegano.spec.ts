import { getDecodedMessage, getEncodedBase64Image } from './stegano';

function createTestImage(size = 50): string {
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const context = canvas.getContext('2d') as CanvasRenderingContext2D;
  context.fillStyle = '#336699';
  context.fillRect(0, 0, size, size);
  return canvas.toDataURL('image/png');
}

describe('steganography utils', () => {
  it('round-trips a hidden message through an image', async () => {
    const image = createTestImage();
    const encoded = await getEncodedBase64Image(
      image,
      'secret message',
      'my-password'
    );
    const decoded = await getDecodedMessage(encoded, 'my-password');
    expect(decoded).toBe('secret message');
  });

  it('rejects decoding with the wrong password', async () => {
    const image = createTestImage();
    const encoded = await getEncodedBase64Image(
      image,
      'secret message',
      'my-password'
    );
    await expectAsync(
      getDecodedMessage(encoded, 'wrong-password')
    ).toBeRejectedWithError('Password is incorrect');
  });

  it('rejects decoding an image with no hidden message', async () => {
    const image = createTestImage();
    await expectAsync(
      getDecodedMessage(image, 'my-password')
    ).toBeRejectedWithError('Message not found in the image');
  });

  it('rejects encoding a message too large for the image', async () => {
    const image = createTestImage(2);
    const hugeMessage = 'x'.repeat(1000);
    await expectAsync(
      getEncodedBase64Image(image, hugeMessage, 'my-password')
    ).toBeRejectedWithError('Message length is too large to hide in image');
  });
});
