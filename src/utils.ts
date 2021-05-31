import { encrypt, decrypt } from "sjcl";
import { DELIMITER_CHARACTER } from "./constants";

export const fetchDarkMode = (): boolean => {
  let mode = false;
  const value = localStorage.getItem("darkMode");
  if (value) {
    mode = value === "1";
  } else {
    const media = window.matchMedia("(prefers-color-scheme: dark)");
    mode = media.matches;
  }
  return mode;
};

export const storeDarkMode = (mode: boolean): void => {
  const value = mode ? "1" : "0";
  localStorage.setItem("darkMode", value);
};

export const saveImage = (data: string): void => {
  const a = document.createElement("a");
  a.download = "output";
  a.href = data;
  a.click();
};

export const copyData = (data: string): void => {
  const input = document.createElement("input");
  document.body.appendChild(input);
  input.value = data;
  input.select();
  document.execCommand("copy");
  document.body.removeChild(input);
};

export const readImage = (file: File): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.readAsDataURL(file);
    reader.onload = function () {
      resolve(reader.result as string);
    };
    reader.onerror = function () {
      reject(reader.error);
    };
  });

export const getImageData = (imageSource: string): ImageData | null => {
  let result = null;

  const image = new Image();
  image.src = imageSource;

  const canvas = document.createElement('canvas');
  canvas.width = image.width;
  canvas.height = image.height;

  const context = canvas.getContext('2d');

  if (context) {
    context.drawImage(image, 0, 0, canvas.width, canvas.height);
    result = context.getImageData(0, 0, canvas.width, canvas.height);
  }

  return result;
}

export const getImageSource = (imageData: ImageData): string => {
  let result = "";

  const canvas = document.createElement('canvas');
  canvas.width = imageData.width;
  canvas.height = imageData.height;

  const context = canvas.getContext('2d');

  if (context) {
    context.putImageData(imageData, 0, 0);
    result = canvas.toDataURL("image/png");
  }

  return result;
}

export const getEncodedImageSource = (imageSource: string, message: string, password: string): string => {
  let result = "";

  const imageData = getImageData(imageSource);
  if (!imageData) {
    return "Invalid image detected."
  }

  const ciphertext = encrypt(password, message);

  const encryptedMessage = ciphertext + DELIMITER_CHARACTER;

  let counter = 0;
  let binaryMessage = "";

  for (let i = 0; i < encryptedMessage.length; i++) {
    binaryMessage += encryptedMessage[i].charCodeAt(0).toString(2).padStart(8, '0');
  }

  for (let i = 0; i < imageData.data.length; i += 4) {
    for (let offset = 0; offset < 3; offset++) {
      if (counter < binaryMessage.length) {
        imageData.data[i + offset] += parseInt(binaryMessage[counter]);
        counter++;
      }
      else {
        break;
      }
    }
  }

  result = getImageSource(imageData);

  return result;
};

export const getDecodedMessage = (imageSource: string, password: string): string => {
  let result = ""

  const imageData = getImageData(imageSource);
  if (!imageData) {
    return "Invalid image detected."
  }

  const delimiterBits = DELIMITER_CHARACTER.charCodeAt(0).toString(2).padStart(8, '0');

  let completed = false;
  let ciphertext = "";
  let tempBits = ""

  for (let i = 0; i < imageData.data.length; i += 4) {
    for (let offset = 0; offset < 3; offset++) {
      if (imageData.data[i + offset] % 2 === 0) {
        tempBits += "0";
      } else {
        tempBits += "1";
      }
      if (tempBits.length === 8) {
        if (tempBits === delimiterBits) {
          completed = true;
          break;
        }
        ciphertext += String.fromCharCode(parseInt(tempBits, 2));
        tempBits = ""
      }
    }
    if (completed) {
      break;
    }
  }

  result = decrypt(password, ciphertext)

  return result;
};