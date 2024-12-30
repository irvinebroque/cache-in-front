const isCacheable = (response: Response): boolean => {
	const cacheControl = response.headers.get('cache-control');
	if (!cacheControl) return false;

	// Parse cache-control directives
	const directives = cacheControl.split(',').map(d => d.trim().toLowerCase());
	
	// Check for no-store directive which prohibits caching
	if (directives.includes('no-store')) return false;
	
	// Check for max-age directive
	const maxAgeDirective = directives.find(d => d.startsWith('max-age='));
	if (!maxAgeDirective) return false;
	
	const maxAge = parseInt(maxAgeDirective.split('=')[1]);
	return maxAge > 0;
};

export const cachedFetch = (
	handler: (request: Request, env: Env, ctx: ExecutionContext) => Promise<Response>
) => async (request: Request, env: Env, ctx: ExecutionContext) => {
	// Only cache GET requests
	if (request.method !== 'GET') {
		return handler(request, env, ctx);
	}

	const cache = caches.default;
	const cacheKey = new Request(request.url, {
		method: 'GET',
		headers: request.headers
	});

	// Try to find cached response
	let response = await cache.match(cacheKey);
	if (response) {
		return response;
	}

	// Get fresh response from handler
	response = await handler(request, env, ctx);

	// If response is cacheable, store it in the cache
	if (isCacheable(response)) {
		ctx.waitUntil(cache.put(cacheKey, response.clone()));
	}

	return response;
};
