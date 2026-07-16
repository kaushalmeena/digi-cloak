export const saveImage = (data: string): void => {
  const anchorEl = document.createElement('a');
  anchorEl.download = 'output';
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
