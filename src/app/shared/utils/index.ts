import CryptoJS from 'crypto-js';
import {
  BITS_PER_CHAR,
  MESSAGE_BORDER,
  MESSAGE_FORMAT,
  MESSAGE_HEADER,
} from '../constants';

export const fetchDarkMode = (): boolean => {
  let mode = false;
  const value = localStorage.getItem('darkMode');
  if (value) {
    mode = value === '1';
  } else {
    const media = window.matchMedia('(prefers-color-scheme: dark)');
    mode = media.matches;
  }
  return mode;
};

export const storeDarkMode = (mode: boolean): void => {
  const value = mode ? '1' : '0';
  localStorage.setItem('darkMode', value);
};

export const saveImage = (data: string): void => {
  const a = document.createElement('a');
  a.download = 'output';
  a.href = data;
  a.click();
};

export const copyText = (text: string): Promise<void> => {
  return navigator.clipboard.writeText(text);
};

export const getBase64ImageFromBlob = (blob: Blob): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.readAsDataURL(blob);

    reader.onload = (event) => resolve(event.target?.result as string);
    reader.onerror = (event) => reject(event.target?.error);
  });

export const getImageDataFromBase64Image = (
  base64Image: string
): ImageData | null => {
  let result = null;

  const image = new Image();
  image.src = base64Image;

  const canvas = document.createElement('canvas');
  canvas.width = image.width;
  canvas.height = image.height;

  const context = canvas.getContext('2d');

  if (context) {
    context.drawImage(image, 0, 0, canvas.width, canvas.height);
    result = context.getImageData(0, 0, canvas.width, canvas.height);
  }

  return result;
};

export const getBase64ImageFromImageData = (imageData: ImageData): string => {
  let result = '';

  const canvas = document.createElement('canvas');
  canvas.width = imageData.width;
  canvas.height = imageData.height;

  const context = canvas.getContext('2d');

  if (context) {
    context.putImageData(imageData, 0, 0);
    result = canvas.toDataURL('image/png', '0.95');
  }

  return result;
};

export const getFormattedMessage = (message: string): string => {
  const length = message.length.toString();
  return MESSAGE_FORMAT.replace('<L>', length).replace('<M>', message);
};

export const getEncodedBase64Image = async (
  base64Image: string,
  message: string,
  password: string
): Promise<string> => {
  const imageData = getImageDataFromBase64Image(base64Image);
  if (!imageData) {
    throw new Error('Cannot generate image data from base64 image');
  }

  const ciphertext = CryptoJS.AES.encrypt(message, password).toString();

  const encryptedMessage = getFormattedMessage(ciphertext);

  if (encryptedMessage.length > imageData.data.length) {
    throw new Error('Message length is too large to hide in image');
  }

  let binaryMessage = '';

  for (let i = 0; i < encryptedMessage.length; i += 1) {
    binaryMessage += encryptedMessage[i]
      .charCodeAt(0)
      .toString(2)
      .padStart(BITS_PER_CHAR, '0');
  }

  for (let i = 0; i < binaryMessage.length; i += 1) {
    imageData.data[i] = (imageData.data[i] & 254) + Number(binaryMessage[i]);
  }

  const result = getBase64ImageFromImageData(imageData);
  if (!result) {
    throw new Error('Cannot generate base64 image from image data');
  }

  return result;
};

export const getDecodedTextFromImageData = (
  range: [number, number],
  imageData: ImageData
): string => {
  let result = '';

  let tempBits = '';
  let tempChar = '';

  const [startIndex, endIndex] = range;

  for (let i = startIndex; i < endIndex; i += 1) {
    if (imageData.data[i] % 2 === 0) {
      tempBits += '0';
    } else {
      tempBits += '1';
    }
    if (tempBits.length === BITS_PER_CHAR) {
      tempChar = String.fromCharCode(parseInt(tempBits, 2));
      tempBits = '';
      result += tempChar;
    }
  }

  return result;
};

export const getMessageHeaderFromImageData = (imageData: ImageData): string =>
  getDecodedTextFromImageData(
    [0, MESSAGE_HEADER.length * BITS_PER_CHAR],
    imageData
  );

export const getCiphertextRangeFromImageData = (
  imageData: ImageData
): [number, number] | null => {
  let result = '';

  let borderCount = 0;

  let tempBits = '';
  let tempChar = '';

  const startIndex = MESSAGE_HEADER.length * BITS_PER_CHAR;
  const endIndex = imageData.data.length;

  for (let i = startIndex; i < endIndex; i += 1) {
    if (imageData.data[i] % 2 === 0) {
      tempBits += '0';
    } else {
      tempBits += '1';
    }
    if (tempBits.length === BITS_PER_CHAR) {
      tempChar = String.fromCharCode(parseInt(tempBits, 2));
      tempBits = '';
      if (tempChar === MESSAGE_BORDER) {
        borderCount += 1;
        if (borderCount === 1) {
          continue;
        }
        if (borderCount === 2) {
          const ciphertextLength = Number(result);
          const ciphertextStartIndex = i + 1;
          const ciphertextEndIndex =
            ciphertextStartIndex + ciphertextLength * BITS_PER_CHAR;
          return [ciphertextStartIndex, ciphertextEndIndex];
        }
        return null;
      }
      if (isNaN(Number(tempChar))) {
        return null;
      }
      result += tempChar;
    }
  }

  return null;
};

export const getDecodedMessage = async (
  base64Image: string,
  password: string
): Promise<string> => {
  const imageData = getImageDataFromBase64Image(base64Image);
  if (!imageData) {
    throw new Error('Cannot generate image data from base64 image');
  }

  const header = getMessageHeaderFromImageData(imageData);
  if (header !== MESSAGE_HEADER) {
    throw new Error('Message not found in the image');
  }

  const range = getCiphertextRangeFromImageData(imageData);
  if (!range) {
    throw new Error('Message not found in the image');
  }

  const ciphertext = getDecodedTextFromImageData(range, imageData);

  const result = CryptoJS.AES.decrypt(ciphertext, password).toString(CryptoJS.enc.Utf8);
  if (!result) {
    throw new Error('Password is incorrect');
  }

  return result;
};
