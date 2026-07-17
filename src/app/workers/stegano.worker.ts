import { decryptMessage, encryptMessage } from '../utils/crypto';
import {
  encodePayloadIntoImageData,
  extractPayloadFromImageData,
} from '../utils/stegano';
import type { SteganoRequest, SteganoResponse } from './messages';

async function getImageData(base64Image: string): Promise<ImageData> {
  let bitmap: ImageBitmap;
  try {
    const blob = await (await fetch(base64Image)).blob();
    bitmap = await createImageBitmap(blob);
  } catch {
    throw new Error('Cannot load base64 image');
  }
  const canvas = new OffscreenCanvas(bitmap.width, bitmap.height);
  const context = canvas.getContext('2d');
  if (!context) {
    throw new Error('Cannot generate image data from base64 image');
  }
  context.drawImage(bitmap, 0, 0);
  return context.getImageData(0, 0, bitmap.width, bitmap.height);
}

async function toDataUrl(imageData: ImageData): Promise<string> {
  const canvas = new OffscreenCanvas(imageData.width, imageData.height);
  const context = canvas.getContext('2d');
  if (!context) {
    throw new Error('Cannot generate base64 image from image data');
  }
  context.putImageData(imageData, 0, 0);
  const blob = await canvas.convertToBlob({ type: 'image/png' });
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(blob);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(new Error('Cannot read encoded image'));
  });
}

addEventListener('message', async ({ data }: MessageEvent<SteganoRequest>) => {
  const response: SteganoResponse = { id: data.id, ok: true };
  try {
    const imageData = await getImageData(data.image);
    if (data.type === 'encode') {
      const payload = await encryptMessage(data.message ?? '', data.password);
      encodePayloadIntoImageData(imageData, payload);
      response.result = await toDataUrl(imageData);
    } else {
      const payload = extractPayloadFromImageData(imageData);
      response.result = await decryptMessage(payload, data.password);
    }
  } catch (error) {
    response.ok = false;
    response.error =
      error instanceof Error ? error.message : 'Something went wrong';
  }
  postMessage(response);
});
