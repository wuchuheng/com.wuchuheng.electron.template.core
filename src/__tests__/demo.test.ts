import { describe, it, expect } from 'vitest';
import { getCoreHello } from '../index';

describe('Core Library Demo', () => {
  it('should return the correct hello message', () => {
    const result = getCoreHello();
    expect(result).toBe('Hello from Core Engine!');
  });

  it('should pass a basic sanity check', () => {
    expect(1 + 1).toBe(2);
  });
});
