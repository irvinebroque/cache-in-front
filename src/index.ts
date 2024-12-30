import { cachedFetch } from './cachedFetch';

export default {
	fetch: cachedFetch(async (request, env, ctx) => {
		return new Response('Hello World!');
	}),
} satisfies ExportedHandler<Env>;
