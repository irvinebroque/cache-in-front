import { WorkerEntrypoint } from "cloudflare:workers";
import { cachedFetch } from './cachedFetch';

export class CacheableWorker implements WorkerEntrypoint {
  env: any;
  ctx: ExecutionContext;

  constructor() {
    this.env = {};
    this.ctx = {
      waitUntil: () => {},
      passThroughOnException: () => {}
    };
  }

  async fetch(request: Request, env: any, ctx: ExecutionContext): Promise<Response> {
    this.env = env;
    this.ctx = ctx;
    
    const handler = cachedFetch(async (req) => {
      return this.fetchWithCache(req);
    });
    
    return handler(request, env, ctx);
  }

  protected async fetchWithCache(request: Request): Promise<Response> {
    // Default implementation returns 404, should be overridden by subclasses
    return new Response('Not Found', { status: 404 });
  }
}
