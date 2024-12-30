import { cachedFetch } from './cachedFetch';

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export default {
	fetch: cachedFetch(async (request, env, ctx) => {
		// Simulate expensive work
		await sleep(4000); // 4 seconds

		const url = new URL(request.url);
		const message = `Hello from ${url.pathname}!`;
		
		console.log(`Handling request for URL: ${request.url}`);

		return new Response(message, {
			headers: {
				'Cache-Control': 'public, max-age=3600',
				'Content-Type': 'text/plain'
			}
		});
	}),
} satisfies ExportedHandler<Env>;
