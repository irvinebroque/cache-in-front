const parseCacheControl = (header: string | null) => {
	if (!header) return new Map<string, string>();
	
	const directives = new Map<string, string>();
	header.split(',').forEach(directive => {
		const [key, value] = directive.trim().toLowerCase().split('=');
		directives.set(key, value || 'true');
	});
	return directives;
};

const isCacheable = (response: Response): boolean => {
	const cacheControl = parseCacheControl(response.headers.get('cache-control'));
	
	// Check no-store directive first - it takes precedence
	if (cacheControl.has('no-store')) return false;

	// Private responses can be cached in browser/client caches
	if (cacheControl.has('private')) return true;
	
	// Public responses can be cached anywhere
	if (cacheControl.has('public')) return true;

	// Check max-age and s-maxage
	const maxAge = cacheControl.get('max-age');
	const sMaxAge = cacheControl.get('s-maxage');
	
	if (maxAge) {
		const age = parseInt(maxAge);
		if (!isNaN(age) && age > 0) return true;
	}

	if (sMaxAge) {
		const age = parseInt(sMaxAge);
		if (!isNaN(age) && age > 0) return true;
	}

	return false;
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

	// Check request cache-control directives
	const reqCacheControl = parseCacheControl(request.headers.get('cache-control'));
	
	// Honor no-store in request
	if (reqCacheControl.has('no-store')) {
		return handler(request, env, ctx);
	}

	// Try to find cached response if not no-cache
	if (!reqCacheControl.has('no-cache')) {
		const cachedResponse = await cache.match(cacheKey);
		if (cachedResponse) {
			// Check if cached response is still fresh based on its max-age
			const respCacheControl = parseCacheControl(cachedResponse.headers.get('cache-control'));
			const maxAge = respCacheControl.get('max-age');
			if (maxAge) {
				const age = parseInt(maxAge);
				if (!isNaN(age)) {
					const responseDate = new Date(cachedResponse.headers.get('date') || '').getTime();
					if (Date.now() - responseDate <= age * 1000) {
						return cachedResponse;
					}
				}
			}
		}
	}

	// Get fresh response from handler
	const response = await handler(request, env, ctx);

	// If response is cacheable, store it in the cache
	if (isCacheable(response)) {
		ctx.waitUntil(cache.put(cacheKey, response.clone()));
	}

	return response;
};
