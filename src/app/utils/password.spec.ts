import { estimateStrength, generatePassword } from './password';

describe('password utils', () => {
  describe('estimateStrength', () => {
    it('rates empty and short input as weak', () => {
      expect(estimateStrength('').label).toBe('Weak');
      expect(estimateStrength('abc').label).toBe('Weak');
    });

    it('penalises common words and predictable runs', () => {
      expect(estimateStrength('Password123!').level).toBeLessThan(2);
      expect(estimateStrength('abcdefgh12345678').level).toBeLessThan(2);
      expect(estimateStrength('aaaaaaaaaaaaaaaaaaaa').label).toBe('Weak');
    });

    it('rates long mixed passwords as strong', () => {
      expect(estimateStrength('Correct-Horse-Battery-42').label).toBe('Strong');
    });
  });

  describe('generatePassword', () => {
    it('produces four dash-separated groups of five', () => {
      expect(generatePassword()).toMatch(
        /^[A-Za-z0-9]{5}(-[A-Za-z0-9]{5}){3}$/,
      );
    });

    it('avoids look-alike characters', () => {
      for (let i = 0; i < 50; i += 1) {
        expect(generatePassword()).not.toMatch(/[0O1lI]/);
      }
    });

    it('is rated strong and differs each time', () => {
      const first = generatePassword();
      expect(estimateStrength(first).label).toBe('Strong');
      expect(generatePassword()).not.toBe(first);
    });
  });
});
