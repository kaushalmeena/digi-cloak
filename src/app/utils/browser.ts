import { IMAGE_EXTENSIONS } from '../constants';

export const saveImage = (data: string, filename = 'output.png'): void => {
  const anchorEl = document.createElement('a');
  anchorEl.download = filename;
  anchorEl.href = data;
  anchorEl.click();
};

export const copyText = (text: string): Promise<void> =>
  navigator.clipboard.writeText(text);

export const getBase64ImageFromBlob = (blob: Blob): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(blob);
    reader.onload = (event) => resolve(event.target?.result as string);
    reader.onerror = (event) => reject(event.target?.error);
  });

export const dataUrlToFile = async (
  dataUrl: string,
  name: string,
): Promise<File> => {
  const blob = await (await fetch(dataUrl)).blob();
  return new File([blob], name, { type: blob.type });
};

/** Whether the system share sheet can take files (most phones, some desktops). */
export const canShareFiles = (): boolean => {
  if (typeof navigator.canShare !== 'function') {
    return false;
  }
  try {
    const probe = new File([new Uint8Array(1)], 'probe.png', {
      type: 'image/png',
    });
    return navigator.canShare({ files: [probe] });
  } catch {
    return false;
  }
};

/** Resolves false when the person closes the share sheet without sharing. */
export const shareFile = async (file: File): Promise<boolean> => {
  try {
    await navigator.share({ files: [file] });
    return true;
  } catch (error) {
    if (error instanceof DOMException && error.name === 'AbortError') {
      return false;
    }
    throw error;
  }
};

export const canReadClipboardImages = (): boolean =>
  typeof navigator.clipboard?.read === 'function';

/** First image on the clipboard as a File, or null when there is none. */
export const readClipboardImage = async (): Promise<File | null> => {
  const items = await navigator.clipboard.read();
  for (const item of items) {
    const type = item.types.find((t) => t.startsWith('image/'));
    if (type) {
      const blob = await item.getType(type);
      const ext = IMAGE_EXTENSIONS[type] ?? 'png';
      return new File([blob], `pasted-image.${ext}`, { type });
    }
  }
  return null;
};

/**
 * Downloads an image from a link straight into the page. Only works for
 * sites that allow cross-origin downloads (CORS); callers explain the rest.
 */
export const fetchImageFile = async (link: string): Promise<File> => {
  let url: URL;
  try {
    url = new URL(link);
  } catch {
    throw new Error('Enter a full link starting with https://');
  }
  if (url.protocol !== 'https:' && url.protocol !== 'http:') {
    throw new Error('Enter a full link starting with https://');
  }

  let response: Response;
  try {
    response = await fetch(url, { mode: 'cors', credentials: 'omit' });
  } catch {
    throw new Error(
      "Couldn't load that link. Many sites block downloads from other pages; save the image and drop it here instead.",
    );
  }
  if (!response.ok) {
    throw new Error(`That link returned an error (${response.status}).`);
  }
  const blob = await response.blob();
  if (!blob.type.startsWith('image/')) {
    throw new Error("That link doesn't point to an image.");
  }
  const name =
    decodeURIComponent(url.pathname.split('/').pop() || '') || 'image';
  return new File([blob], name, { type: blob.type });
};
