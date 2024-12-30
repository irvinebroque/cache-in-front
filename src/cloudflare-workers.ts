import { WorkerEntrypoint } from "cloudflare:workers";
import { cachedFetch } from './cachedFetch';

export class CacheableWorker extends WorkerEntrypoint {

  async fetch(request: Request): Promise<Response> {
    const handler = cachedFetch(async (req, env, ctx) => {
      // Default implementation returns 404, should be overridden by subclasses
      return new Response('Not Found', { status: 404 });
    });
    
    return handler(request, this.env, this.ctx);
  }
}
