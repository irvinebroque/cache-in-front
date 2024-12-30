import { describe, it, expect, vi, beforeEach } from 'vitest';
import { cachedFetch } from '../src/cachedFetch';

describe('cachedFetch', () => {
	let mockCache: { default: { match: vi.Mock, put: vi.Mock } };
	let mockHandler: vi.Mock;
	let mockCtx: { waitUntil: vi.Mock };

	beforeEach(() => {
		// Setup mocks
		mockCache = {
			default: {
				match: vi.fn(),
				put: vi.fn()
			}
		};
		mockHandler = vi.fn();
		mockCtx = {
			waitUntil: vi.fn()
		};

		// @ts-ignore - mock global caches
		global.caches = mockCache;
	});

	it('should bypass cache for non-GET requests', async () => {
		const request = new Request('https://example.com', { method: 'POST' });
		const expectedResponse = new Response('test');
		mockHandler.mockResolvedValue(expectedResponse);

		const wrapped = cachedFetch(mockHandler);
		const response = await wrapped(request, {}, mockCtx);

		expect(mockCache.default.match).not.toHaveBeenCalled();
		expect(mockHandler).toHaveBeenCalledWith(request, {}, mockCtx);
		expect(response).toBe(expectedResponse);
	});

	it('should return cached response when available', async () => {
		const request = new Request('https://example.com');
		const cachedResponse = new Response('cached');
		mockCache.default.match.mockResolvedValue(cachedResponse);

		const wrapped = cachedFetch(mockHandler);
		const response = await wrapped(request, {}, mockCtx);

		expect(response).toBe(cachedResponse);
		expect(mockHandler).not.toHaveBeenCalled();
	});

	it('should not cache responses with no-store directive', async () => {
		const request = new Request('https://example.com');
		const response = new Response('test', {
			headers: { 'Cache-Control': 'no-store' }
		});
		mockHandler.mockResolvedValue(response);

		const wrapped = cachedFetch(mockHandler);
		await wrapped(request, {}, mockCtx);

		expect(mockCache.default.put).not.toHaveBeenCalled();
	});

	it('should cache responses with max-age directive', async () => {
		const request = new Request('https://example.com');
		const response = new Response('test', {
			headers: { 'Cache-Control': 'max-age=3600' }
		});
		mockHandler.mockResolvedValue(response);

		const wrapped = cachedFetch(mockHandler);
		await wrapped(request, {}, mockCtx);

		expect(mockCache.default.put).toHaveBeenCalled();
	});

	it('should respect request no-cache directive', async () => {
		const request = new Request('https://example.com', {
			headers: { 'Cache-Control': 'no-cache' }
		});
		const cachedResponse = new Response('cached');
		const freshResponse = new Response('fresh');
		mockCache.default.match.mockResolvedValue(cachedResponse);
		mockHandler.mockResolvedValue(freshResponse);

		const wrapped = cachedFetch(mockHandler);
		const response = await wrapped(request, {}, mockCtx);

		expect(response).toBe(freshResponse);
		expect(mockHandler).toHaveBeenCalled();
	});

	it('should respect request max-age directive', async () => {
		const request = new Request('https://example.com', {
			headers: { 'Cache-Control': 'max-age=60' }
		});
		
		// Create a cached response that's older than max-age
		const cachedResponse = new Response('cached', {
			headers: { 'Date': new Date(Date.now() - 120000).toUTCString() }
		});
		const freshResponse = new Response('fresh');
		mockCache.default.match.mockResolvedValue(cachedResponse);
		mockHandler.mockResolvedValue(freshResponse);

		const wrapped = cachedFetch(mockHandler);
		const response = await wrapped(request, {}, mockCtx);

		expect(response).toBe(freshResponse);
		expect(mockHandler).toHaveBeenCalled();
	});

	it('should cache private responses', async () => {
		const request = new Request('https://example.com');
		const response = new Response('test', {
			headers: { 'Cache-Control': 'private' }
		});
		mockHandler.mockResolvedValue(response);

		const wrapped = cachedFetch(mockHandler);
		await wrapped(request, {}, mockCtx);

		expect(mockCache.default.put).toHaveBeenCalled();
	});

	it('should cache public responses', async () => {
		const request = new Request('https://example.com');
		const response = new Response('test', {
			headers: { 'Cache-Control': 'public' }
		});
		mockHandler.mockResolvedValue(response);

		const wrapped = cachedFetch(mockHandler);
		await wrapped(request, {}, mockCtx);

		expect(mockCache.default.put).toHaveBeenCalled();
	});
});
