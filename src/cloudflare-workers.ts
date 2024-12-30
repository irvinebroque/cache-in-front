/**
 * Types and utilities for Cloudflare Workers
 */
import { WorkerEntrypoint as CloudflareWorkerEntrypoint } from "cloudflare:workers";
import { cachedFetch } from './cachedFetch';

export interface Env {
  // Add environment variables here
}

export interface WorkerContext {
  env: Env;
  waitUntil(promise: Promise<any>): void;
  passThroughOnException(): void;
}


/**
 * Base Worker class with caching support
 */
export class CacheableWorker extends CloudflareWorkerEntrypoint {
  /**
   * Fetches a resource with caching support
   * @param request The incoming request
   * @returns A cached or fresh response
   */
  async fetchWithCache(request: Request): Promise<Response> {
    const handler = cachedFetch(async (req, env, ctx) => {
      // Default implementation returns 404, should be overridden by subclasses
      return new Response('Not Found', { status: 404 });
    });
    
    return handler(request, this.env, this.ctx);
  }
}
