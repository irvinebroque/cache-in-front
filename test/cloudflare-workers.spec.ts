import { describe, it, expect, vi, beforeEach } from 'vitest';
import { CacheableWorker } from '../src/cloudflare-workers';

class TestWorker extends CacheableWorker {
  protected async fetchWithCache(request: Request): Promise<Response> {
    return new Response('Test Response', {
      headers: {
        'Cache-Control': 'public, max-age=3600',
        'Content-Type': 'text/plain'
      }
    });
  }
}

describe('CacheableWorker', () => {
  let worker: TestWorker;
  let mockRequest: Request;
  let mockEnv: any;
  let mockCtx: ExecutionContext;

  beforeEach(() => {
    worker = new TestWorker();
    mockRequest = new Request('https://example.com');
    mockEnv = {};
    mockCtx = {
      waitUntil: vi.fn(),
      passThroughOnException: vi.fn()
    };
    
    // Setup worker env and ctx
    worker.env = mockEnv;
    worker.ctx = mockCtx;
    
    // Mock caches API
    global.caches = {
      default: {
        match: vi.fn(),
        put: vi.fn()
      }
    } as any;
  });

  it('should handle requests through fetch method', async () => {
    const response = await worker.fetch(mockRequest);
    
    expect(response).toBeInstanceOf(Response);
    expect(await response.text()).toBe('Test Response');
    expect(response.headers.get('Cache-Control')).toBe('public, max-age=3600');
  });

  it('should attempt to use cache for GET requests', async () => {
    await worker.fetch(mockRequest);
    
    expect(global.caches.default.match).toHaveBeenCalled();
  });

  it('should store cacheable responses in cache', async () => {
    await worker.fetch(mockRequest);
    
    expect(global.caches.default.put).toHaveBeenCalled();
    expect(mockCtx.waitUntil).toHaveBeenCalled();
  });

  it('should not cache non-GET requests', async () => {
    const postRequest = new Request('https://example.com', { method: 'POST' });
    await worker.fetch(postRequest);
    
    expect(global.caches.default.match).not.toHaveBeenCalled();
    expect(global.caches.default.put).not.toHaveBeenCalled();
  });

  it('should return cached response if available', async () => {
    const cachedResponse = new Response('Cached Response', {
      headers: {
        'Cache-Control': 'public, max-age=3600',
        'Date': new Date().toUTCString()
      }
    });
    
    (global.caches.default.match as any).mockResolvedValueOnce(cachedResponse);
    
    const response = await worker.fetch(mockRequest);
    expect(await response.text()).toBe('Cached Response');
  });
});
