/**
 * Welcome to Cloudflare Workers! This is your first worker.
 *
 * - Run `npm run dev` in your terminal to start a development server
 * - Open a browser tab at http://localhost:8787/ to see your worker in action
 * - Run `npm run deploy` to publish your worker
 *
 * Bind resources to your worker in `wrangler.toml`. After adding bindings, a type definition for the
 * `Env` object can be regenerated with `npm run cf-typegen`.
 *
 * Learn more at https://developers.cloudflare.com/workers/
 */

const createHandler = (
	handler: (request: Request, env: Env, ctx: ExecutionContext) => Promise<Response>
): ExportedHandler<Env> => ({
	async fetch(request, env, ctx) {
		return handler(request, env, ctx);
	},
});

export default createHandler(async (request, env, ctx) => {
	return new Response('Hello World!');
});
