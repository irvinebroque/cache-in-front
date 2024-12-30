// test/index.spec.ts
import { describe, it, expect, vi } from 'vitest';
import worker from '../src/index';
import './types';

describe('Hello World worker', () => {
  it('responds with Hello World!', async () => {
    const request = new Request('http://example.com');
    const ctx = {
      waitUntil: vi.fn(),
      passThroughOnException: vi.fn()
    };
    const env = {};
    
    const response = await worker.fetch(request, env, ctx);
    expect(await response.text()).toBe('Hello from /!');
  });
});
