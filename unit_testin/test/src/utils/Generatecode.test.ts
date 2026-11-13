import { describe, it, expect } from 'vitest';
import { generateSixDigitCode } from '../../../src/utils/generateCode.util';

describe('generateCode utility checks', () => {
  it('should return a string type and have a length of 6 chars', () => {
    const code = generateSixDigitCode();
    expect(typeof code).toBe('string');
    expect(code).toHaveLength(6);
    expect(/^\d+$/.test(code)).toBe(true);
  });

  it('stays within the 100000 - 999999 bounds and never leads with 0', () => {
    for (let i = 0; i < 50; i++) {
      const code = generateSixDigitCode();
      const num = parseInt(code, 10);
      
      expect(num).toBeGreaterThanOrEqual(100000);
      expect(num).toBeLessThanOrEqual(999999);
      expect(code.startsWith('0')).toBe(false);
    }
  });
});