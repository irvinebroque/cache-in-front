import { cachedFetch } from './cachedFetch';

export default {
	fetch: cachedFetch(async (request, env, ctx) => {
		return new Response('Hello World!', {
			headers: {
				'Cache-Control': 'public, max-age=3600',
				'Content-Type': 'text/plain'
			}
		});
	}),
} satisfies ExportedHandler<Env>;
