import { ErrorCodes } from "@/shared/constants";
import { Redis } from "@upstash/redis";
import type { Context, MiddlewareHandler, Next } from "hono";
import { createErrorResponse } from "../lib/api-response";

interface RedisRateLimitOptions {
	/**
	 * Maximum number of requests allowed within the window
	 */
	limit: number;

	/**
	 * Time window in milliseconds
	 */
	window: number;

	/**
	 * Function to generate a key for the rate limit
	 * Default: Uses IP address
	 */
	getKey?: (c: Context) => string;

	/**
	 * Function called when rate limit is exceeded
	 */
	onFailure?: (c: Context) => Response | Promise<Response>;
}

let redis: Redis | undefined = undefined;

/**
 * Creates a rate limit middleware using Upstash Redis
 */
export function createRateLimitMiddleware(
	options: RedisRateLimitOptions,
): MiddlewareHandler {
	const {
		limit,
		window,
		getKey = (c) =>
			c.req.header("x-forwarded-for") || c.env.cf?.ip || "unknown",
		onFailure = (c) =>
			c.json(
				createErrorResponse({
					code: ErrorCodes.TOO_MANY_REQUESTS,
					message: "Rate limit exceeded. Please try again later.",
					statusCode: 429,
				}),
				429,
			),
	} = options;

	return async (c: Context, next: Next) => {
		// Get the unique key for this client (typically IP address)
		const key = `rate-limit:${getKey(c)}`;
		const now = Date.now();
		const windowStart = now - window;

		if (!redis) {
			redis = new Redis({
				url: process.env.REDIS_URL,
				token: process.env.REDIS_TOKEN,
			});
		}

		// Execute Redis commands in a pipeline for better performance
		const pipeline = redis.pipeline();

		// Remove expired requests (before the current window)
		pipeline.zremrangebyscore(key, 0, windowStart);

		// Add the current request timestamp with score = current timestamp
		pipeline.zadd(key, { score: now, member: `${now}-${Math.random()}` });

		// Count the number of requests in the current window
		pipeline.zcount(key, windowStart, "+inf");

		// Set the expiration for the key to ensure cleanup
		pipeline.expire(key, Math.ceil(window / 1000) * 2);

		// Execute the pipeline and get results
		const [, , countResult] = await pipeline.exec();
		const requestCount = countResult as number;

		// Check if the limit has been exceeded
		if (requestCount > limit) {
			return onFailure(c);
		}

		// Add rate limit headers to the response
		c.header("X-RateLimit-Limit", limit.toString());
		c.header(
			"X-RateLimit-Remaining",
			Math.max(0, limit - requestCount).toString(),
		);
		c.header("X-RateLimit-Reset", Math.ceil((now + window) / 1000).toString());

		// Continue to the next middleware/handler
		return next();
	};
}
