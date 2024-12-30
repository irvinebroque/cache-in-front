const cachedFetch = (
	handler: (request: Request, env: Env, ctx: ExecutionContext) => Promise<Response>
) => async (request: Request, env: Env, ctx: ExecutionContext) => {
	return handler(request, env, ctx);
};

export default {
	fetch: cachedFetch(async (request, env, ctx) => {
		return new Response('Hello World!');
	}),
} satisfies ExportedHandler<Env>;
