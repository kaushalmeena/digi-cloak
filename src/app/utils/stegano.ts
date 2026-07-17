import {
  decryptMessage,
  encryptMessage,
  encryptedPayloadLength,
} from './crypto';

/*
 * Container format embedded in the image: "digicloak:<payload length>:<payload>",
 * written one bit at a time into the least significant bit of each R/G/B byte
 * (3 bits per pixel). This layout predates the v2 crypto format and must not
 * change, or previously encoded images become unreadable.
 */
const MESSAGE_BORDER = ':';
const MESSAGE_HEADER = 'digicloak';
const MESSAGE_FORMAT = `${MESSAGE_HEADER}${MESSAGE_BORDER}<L>${MESSAGE_BORDER}<M>`;
const BITS_PER_CHAR = 8;
const BITS_PER_PIXEL = 3;

/* ---------------------------------------------------------------------------
 * Capacity estimation
 * ------------------------------------------------------------------------- */

function containerLength(payloadLength: number): number {
  return (
    MESSAGE_HEADER.length + 2 + String(payloadLength).length + payloadLength
  );
}

export function messageFits(
  width: number,
  height: number,
  messageBytes: number
): boolean {
  const bits =
    containerLength(encryptedPayloadLength(messageBytes)) * BITS_PER_CHAR;
  return bits <= BITS_PER_PIXEL * width * height;
}

/** Approximate number of single-byte characters that fit in a width x height image. */
export function estimateCapacityChars(width: number, height: number): number {
  let low = 0;
  let high = Math.floor((BITS_PER_PIXEL * width * height) / BITS_PER_CHAR);
  while (low < high) {
    const mid = Math.ceil((low + high) / 2);
    if (messageFits(width, height, mid)) {
      low = mid;
    } else {
      high = mid - 1;
    }
  }
  return low;
}

/* ---------------------------------------------------------------------------
 * Pure ImageData encode/decode (safe to run in a Web Worker)
 * ------------------------------------------------------------------------- */

function getFormattedMessage(message: string): string {
  const length = message.length.toString();
  return MESSAGE_FORMAT.replace('<L>', length).replace('<M>', message);
}

export function encodePayloadIntoImageData(
  imageData: ImageData,
  payload: string
): void {
  const formattedMessage = getFormattedMessage(payload);

  let binaryMessage = '';

  for (const char of formattedMessage) {
    binaryMessage += char
      .charCodeAt(0)
      .toString(2)
      .padStart(BITS_PER_CHAR, '0');
  }

  if (
    binaryMessage.length >
    BITS_PER_PIXEL * imageData.height * imageData.width
  ) {
    throw new Error('Message length is too large to hide in image');
  }

  for (let i = 0, j = 0; i < imageData.data.length; i += 1) {
    // Canvas stores RGBA with premultiplied alpha. For any pixel that is not
    // fully opaque, drawing and reading back reverses that multiplication,
    // and the rounding involved changes the exact RGB values — which would
    // corrupt the hidden bits. Forcing alpha to 255 keeps every RGB byte
    // exact, so no data is ever stored in the alpha channel.
    if (i % 4 === 3) {
      imageData.data[i] = 255;
      continue;
    }
    if (j < binaryMessage.length) {
      imageData.data[i] = (imageData.data[i] & 254) + Number(binaryMessage[j]);
      j += 1;
    }
  }
}

function* getDecodedTextGenerator(
  imageData: ImageData
): Generator<string, void, void> {
  let tempBits = '';

  for (let i = 0; i < imageData.data.length; i += 1) {
    // Alpha bytes carry no data — see the premultiplied-alpha note in
    // encodePayloadIntoImageData.
    if (i % 4 === 3) {
      continue;
    }
    if (imageData.data[i] % 2 === 0) {
      tempBits += '0';
    } else {
      tempBits += '1';
    }
    if (tempBits.length === BITS_PER_CHAR) {
      yield String.fromCharCode(parseInt(tempBits, 2));
      tempBits = '';
    }
  }
}

function getMessageHeader(iterator: Generator<string, void, void>): string {
  let header = '';
  let result: IteratorResult<string, void>;

  do {
    result = iterator.next();
    header += result.value;
  } while (!result.done && header.length < MESSAGE_HEADER.length);

  return header;
}

function getMessageLength(iterator: Generator<string, void, void>): number {
  let length = '';
  let border = 0;
  let result: IteratorResult<string, void>;

  do {
    result = iterator.next();

    if (result.value === MESSAGE_BORDER) {
      border += 1;
      if (border === 1) {
        continue;
      }
      if (border === 2) {
        return Number(length);
      }
    }
    if (border === 0 || isNaN(Number(result.value))) {
      return -1;
    }

    length += result.value;
  } while (!result.done);

  return -1;
}

function getMessageContent(
  contentLength: number,
  iterator: Generator<string, void, void>
): string {
  let content = '';
  let result: IteratorResult<string, void>;

  do {
    result = iterator.next();
    content += result.value;
  } while (!result.done && content.length < contentLength);

  return content;
}

export function extractPayloadFromImageData(imageData: ImageData): string {
  const iterator = getDecodedTextGenerator(imageData);

  const header = getMessageHeader(iterator);
  if (header !== MESSAGE_HEADER) {
    throw new Error('Message not found in the image');
  }

  const length = getMessageLength(iterator);
  if (length === -1) {
    throw new Error('Message not found in the image');
  }

  return getMessageContent(length, iterator);
}

/* ---------------------------------------------------------------------------
 * Main-thread canvas wrappers
 * ------------------------------------------------------------------------- */

function loadImage(base64Image: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const imageEl = new Image();
    imageEl.onload = () => resolve(imageEl);
    imageEl.onerror = () => reject(new Error('Cannot load base64 image'));
    imageEl.src = base64Image;
  });
}

async function getImageDataFromBase64Image(
  base64Image: string
): Promise<ImageData> {
  const imageEl = await loadImage(base64Image);

  const canvasEl = document.createElement('canvas');
  canvasEl.width = imageEl.width;
  canvasEl.height = imageEl.height;

  const context = canvasEl.getContext('2d');
  if (!context) {
    throw new Error('Cannot generate image data from base64 image');
  }

  context.drawImage(imageEl, 0, 0, canvasEl.width, canvasEl.height);
  return context.getImageData(0, 0, canvasEl.width, canvasEl.height);
}

function getBase64ImageFromImageData(imageData: ImageData): string {
  const canvasEl = document.createElement('canvas');
  canvasEl.width = imageData.width;
  canvasEl.height = imageData.height;

  const context = canvasEl.getContext('2d');
  if (!context) {
    throw new Error('Cannot generate base64 image from image data');
  }

  context.putImageData(imageData, 0, 0);
  return canvasEl.toDataURL('image/png');
}

export const getEncodedBase64Image = async (
  base64Image: string,
  message: string,
  password: string
): Promise<string> => {
  const imageData = await getImageDataFromBase64Image(base64Image);
  const payload = await encryptMessage(message, password);
  encodePayloadIntoImageData(imageData, payload);
  return getBase64ImageFromImageData(imageData);
};

export const getDecodedMessage = async (
  base64Image: string,
  password: string
): Promise<string> => {
  const imageData = await getImageDataFromBase64Image(base64Image);
  const payload = extractPayloadFromImageData(imageData);
  return decryptMessage(payload, password);
};
