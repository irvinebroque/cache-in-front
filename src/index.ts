import { CacheableWorker } from './cloudflare-workers';

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export default class MyWorker extends CacheableWorker {
  protected async fetchWithCache(request: Request): Promise<Response> {
    // Simulate expensive work
    await sleep(4000); // 4 seconds

    const url = new URL(request.url);
    const message = `Hello from ${url.pathname}!`;
    
    return new Response(message, {
      headers: {
        'Cache-Control': 'public, max-age=360000',
        'Content-Type': 'text/plain'
      }
    });
  }
}
