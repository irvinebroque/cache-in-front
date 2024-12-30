import { cachedFetch } from './cachedFetch';

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export default {
	fetch: cachedFetch(async (request, env, ctx) => {
		// Simulate expensive work
		await sleep(4000); // 4 seconds

		return new Response('Hello World!', {
			headers: {
				'Cache-Control': 'public, max-age=3600',
				'Content-Type': 'text/plain'
			}
		});
	}),
} satisfies ExportedHandler<Env>;
