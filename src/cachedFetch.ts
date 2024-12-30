export const cachedFetch = (
	handler: (request: Request, env: Env, ctx: ExecutionContext) => Promise<Response>
) => async (request: Request, env: Env, ctx: ExecutionContext) => {
	return handler(request, env, ctx);
};
