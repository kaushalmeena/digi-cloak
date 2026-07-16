import { copyText, getBase64ImageFromBlob, saveImage } from './browser';

describe('file utils', () => {
  describe('saveImage', () => {
    it('triggers a download via a temporary anchor element', () => {
      const clickSpy = spyOn(HTMLAnchorElement.prototype, 'click');
      saveImage('data:image/png;base64,abc123');
      expect(clickSpy).toHaveBeenCalled();
    });
  });

  describe('copyText', () => {
    it('delegates to the clipboard API', async () => {
      spyOn(navigator.clipboard, 'writeText').and.resolveTo();
      await copyText('hello');
      expect(navigator.clipboard.writeText).toHaveBeenCalledWith('hello');
    });
  });

  describe('getBase64ImageFromBlob', () => {
    it('resolves with a data URL for the given blob', async () => {
      const blob = new Blob(['hello world'], { type: 'text/plain' });
      const result = await getBase64ImageFromBlob(blob);
      expect(result).toMatch(/^data:text\/plain;base64,/);
    });
  });
});
