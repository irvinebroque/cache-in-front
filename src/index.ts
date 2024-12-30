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
