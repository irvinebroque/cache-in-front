/**
 * Types and utilities for Cloudflare Workers
 */

export interface Env {
  // Add environment variables here
}

export interface WorkerContext {
  env: Env;
  waitUntil(promise: Promise<any>): void;
  passThroughOnException(): void;
}

export type WorkerHandler = (
  request: Request,
  env: Env,
  ctx: WorkerContext
) => Promise<Response>;

/**
 * Creates a Cloudflare Worker handler function
 * @param handler The request handler function
 * @returns A worker handler function
 */
export function createWorker(handler: WorkerHandler): WorkerHandler {
  return async (request: Request, env: Env, ctx: WorkerContext) => {
    try {
      return await handler(request, env, ctx);
    } catch (err) {
      console.error('Worker error:', err);
      return new Response('Internal Server Error', { status: 500 });
    }
  };
}
