import { describe, it, expect, beforeAll } from 'vitest';
import { hashPassword, comparePassword } from '../../../src/utils/password.util';

describe('Password hashing & validation utils', () => {
  const p1 = 'contra1234';
  const p2 = 'oriol6767';
  
  let h1: string;
  let h2: string;

  beforeAll(async () => {
    [h1, h2] = await Promise.all([hashPassword(p1), hashPassword(p2)]);
  });

  it('hashes passwords securely without exposing originals', async () => {
    expect(h1).not.toBe(p1);
    expect(h2).not.toBe(p2);
    expect(typeof h1).toBe('string');
    expect(h1.length).toBeGreaterThan(20);
  });

  it('validates correct passwords successfully', async () => {
    expect(await comparePassword(p1, h1)).toBe(true);
    expect(await comparePassword(p2, h2)).toBe(true);
  });

  it('rejects incorrect password matching', async () => {
    const mismatch = await comparePassword(p1, h2);
    expect(mismatch).toBe(false);
  });
});