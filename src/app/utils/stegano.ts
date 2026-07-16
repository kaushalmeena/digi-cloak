import { AES, enc } from 'crypto-js';

const MESSAGE_BORDER = ':';
const MESSAGE_HEADER = 'digicloak';
const MESSAGE_FORMAT = `${MESSAGE_HEADER}${MESSAGE_BORDER}<L>${MESSAGE_BORDER}<M>`;
const BITS_PER_CHAR = 8;

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
): Promise<ImageData | null> {
  let imageData = null;

  const imageEl = await loadImage(base64Image);

  const canvasEl = document.createElement('canvas');

  canvasEl.width = imageEl.width;
  canvasEl.height = imageEl.height;

  const context = canvasEl.getContext('2d');

  if (context) {
    context.drawImage(imageEl, 0, 0, canvasEl.width, canvasEl.height);
    imageData = context.getImageData(0, 0, canvasEl.width, canvasEl.height);
  }

  return imageData;
}

function getFormattedMessage(message: string): string {
  const length = message.length.toString();
  return MESSAGE_FORMAT.replace('<L>', length).replace('<M>', message);
}

function getBase64ImageFromImageData(imageData: ImageData): string {
  let base64Image = '';

  const canvasEl = document.createElement('canvas');

  canvasEl.width = imageData.width;
  canvasEl.height = imageData.height;

  const context = canvasEl.getContext('2d');

  if (context) {
    context.putImageData(imageData, 0, 0);
    base64Image = canvasEl.toDataURL('image/png', 0.95);
  }

  return base64Image;
}

export const getEncodedBase64Image = async (
  base64Image: string,
  message: string,
  password: string
): Promise<string> => {
  const imageData = await getImageDataFromBase64Image(base64Image);
  if (!imageData) {
    throw new Error('Cannot generate image data from base64 image');
  }

  const ciphertext = AES.encrypt(message, password).toString();

  const formattedMessage = getFormattedMessage(ciphertext);

  let binaryMessage = '';

  for (let i = 0; i < formattedMessage.length; i += 1) {
    binaryMessage += formattedMessage[i]
      .charCodeAt(0)
      .toString(2)
      .padStart(BITS_PER_CHAR, '0');
  }

  if (binaryMessage.length > 3 * imageData.height * imageData.width) {
    throw new Error('Message length is too large to hide in image');
  }

  for (let i = 0, j = 0; i < imageData.data.length; i += 1) {
    if (i % 4 === 3) {
      imageData.data[i] = 255;
      continue;
    }
    if (j < binaryMessage.length) {
      imageData.data[i] = (imageData.data[i] & 254) + Number(binaryMessage[j]);
      j += 1;
    }
  }

  const result = getBase64ImageFromImageData(imageData);
  if (!result) {
    throw new Error('Cannot generate base64 image from image data');
  }

  return result;
};

function* getDecodedTextGenerator(
  imageData: ImageData
): Generator<string, void, void> {
  let tempBits = '';
  let tempChar = '';

  for (let i = 0; i < imageData.data.length; i += 1) {
    if (i % 4 === 3) {
      continue;
    }
    if (imageData.data[i] % 2 === 0) {
      tempBits += '0';
    } else {
      tempBits += '1';
    }
    if (tempBits.length === BITS_PER_CHAR) {
      tempChar = String.fromCharCode(parseInt(tempBits, 2));
      yield tempChar;
      tempBits = '';
    }
  }
}

function getMessageHeader(iterator: Generator<string, void, void>): string {
  let header = '';
  let result = null;

  do {
    result = iterator.next();
    header += result.value;
  } while (!result.done && header.length < MESSAGE_HEADER.length);

  return header;
}

function getMessageLength(iterator: Generator<string, void, void>): number {
  let length = '';
  let border = 0;
  let result = null;

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
  let result = null;

  do {
    result = iterator.next();
    content += result.value;
  } while (!result.done && content.length < contentLength);

  return content;
}

export const getDecodedMessage = async (
  base64Image: string,
  password: string
): Promise<string> => {
  const imageData = await getImageDataFromBase64Image(base64Image);
  if (!imageData) {
    throw new Error('Cannot generate image data from base64 image');
  }

  const iterator = getDecodedTextGenerator(imageData);

  const header = getMessageHeader(iterator);
  if (header !== MESSAGE_HEADER) {
    throw new Error('Message not found in the image');
  }

  const length = getMessageLength(iterator);
  if (length === -1) {
    throw new Error('Message not found in the image');
  }

  const ciphertext = getMessageContent(length, iterator);

  const result = AES.decrypt(ciphertext, password).toString(enc.Utf8);
  if (!result) {
    throw new Error('Password is incorrect');
  }

  return result;
};
