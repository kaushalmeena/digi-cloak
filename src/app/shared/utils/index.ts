import CryptoJS from 'crypto-js';
import { DELIMITER_CHARACTER } from '../constants';

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
    reader.onload = function () {
      resolve(reader.result as string);
    };
    reader.onerror = function () {
      reject(reader.error);
    };
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
    result = canvas.toDataURL();
  }

  return result;
};

export const getEncodedBase64Image = (
  base64Image: string,
  message: string,
  password: string
): string => {
  let result = '';

  const imageData = getImageDataFromBase64Image(base64Image);
  if (!imageData) {
    return 'Invalid image detected.';
  }

  const ciphertext = CryptoJS.AES.encrypt(message, password).toString();

  const encryptedMessage = ciphertext + DELIMITER_CHARACTER;

  let binaryMessage = '';
  let counter = 0;
  let completed = false;

  for (let i = 0; i < encryptedMessage.length; i++) {
    binaryMessage += encryptedMessage[i]
      .charCodeAt(0)
      .toString(2)
      .padStart(8, '0');
  }

  for (let i = 0; i < imageData.data.length; i += 4) {
    for (let offset = 0; offset < 3; offset++) {
      if (counter < binaryMessage.length) {
        imageData.data[i + offset] =
          (imageData.data[i + offset] & 254) + parseInt(binaryMessage[counter]);
        counter += 1;
      } else {
        completed = true;
        break;
      }
    }
    if (completed) {
      break;
    }
  }

  result = getBase64ImageFromImageData(imageData);

  return result;
};

export const getDecodedMessage = (
  base64Image: string,
  password: string
): string => {
  let result = '';

  const imageData = getImageDataFromBase64Image(base64Image);
  if (!imageData) {
    return 'Invalid image detected.';
  }

  let ciphertext = '';
  let tempBits = '';
  let tempChar = null;
  let completed = false;

  for (let i = 0; i < imageData.data.length; i += 4) {
    for (let offset = 0; offset < 3; offset++) {
      if (imageData.data[i + offset] % 2 === 0) {
        tempBits += '0';
      } else {
        tempBits += '1';
      }
      if (tempBits.length === 8) {
        tempChar = String.fromCharCode(parseInt(tempBits, 2));
        if (tempChar === DELIMITER_CHARACTER) {
          completed = true;
          break;
        }
        ciphertext += tempChar;
        tempBits = '';
      }
    }
    if (completed) {
      break;
    }
  }

  if (completed) {
    try {
      result = CryptoJS.AES.decrypt(ciphertext, password).toString(
        CryptoJS.enc.Utf8
      );
    } catch (error) {
      console.error('=========== Decoding', error);
    }
  }

  result = result || 'Message not found in the image.';

  return result;
};
