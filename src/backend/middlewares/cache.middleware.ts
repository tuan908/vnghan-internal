import json from "@/shared/i18n/locales/vi/vi.json";
import type { Context, MiddlewareHandler, Next } from "hono";
import { ContentfulStatusCode } from "hono/utils/http-status";
import {
  type ApiResponse,
  generateRequestId,
  generateTimestamp,
} from "../lib/api-response";
import {
  type CacheEntry,
  type CacheOptions,
  RedisCacheStore,
  defaultOptions,
  invalidateCache,
} from "../lib/cache";
import type { ServerEnvironment } from "../types";

let cacheStore: RedisCacheStore | null = null;

// Cache middleware factory
export const createCacheMiddleware = (
  options: CacheOptions = {},
): MiddlewareHandler<{ Bindings: ServerEnvironment }> => {
  // Merge provided options with defaults
  const opts = { ...defaultOptions, ...options };

  return async (c: Context, next: Next) => {
    const { REDIS_URL, REDIS_TOKEN } = options;
    const user = c.get("user");

    if (!REDIS_URL || !REDIS_TOKEN) {
      throw new Error(json.error.missingEnvironmentVariables);
    }

    if (!cacheStore) {
      // Initialize Redis cache store
      cacheStore = new RedisCacheStore(REDIS_URL, REDIS_TOKEN, opts.namespace);
    }

    // Skip caching for non-cacheable methods
    if (!opts.methods?.includes(c.req.method)) {
      await invalidateCache();
      return await next();
    }

    // Generate cache key
    let cacheKey = opts.keyGenerator!(c);

    const userId = user?.id;
    if (userId) {
      cacheKey += `:user:${userId}`;
    }

    // Add vary headers to cache key if specified
    if (opts.varyByHeaders?.length) {
      const varyValues = opts.varyByHeaders
        .map((header) => c.req.header(header) || "")
        .join(":");
      cacheKey += `:${varyValues}`;
    }

    // Check if we have a valid cached response
    const cachedEntry = await cacheStore.get(cacheKey);

    if (cachedEntry) {
      // Return cached response
      c.header("X-Cache", "HIT");
      c.header("Cache-Control", opts.cacheControl!);

      // Set all original headers
      Object.entries(cachedEntry.headers).forEach(([key, value]) => {
        if (key.toLowerCase() !== "content-length") {
          // Avoid content-length mismatch
          c.header(key, value);
        }
      });

      const decodedBody = JSON.parse(cachedEntry.body) as ApiResponse; // No need to decode if we store properly
      const actualResponseBody = {
        ...decodedBody,
        timestamp: generateTimestamp(),
        requestId: generateRequestId(),
      };
      const status = cachedEntry.status as ContentfulStatusCode;

      // Set content-type header to ensure proper handling in Next.js

      c.header("Content-Type", cachedEntry.contentType);

      return c.json(actualResponseBody, status);
    }

    // Cache miss - proceed with request
    c.header("X-Cache", "MISS");
    await next();

    // Only cache successful responses
    if (c.res && c.res.status >= 200 && c.res.status < 400) {
      try {
        // Clone the response
        const clonedRes = c.res.clone();

        // Get content type for proper handling later
        const contentType = clonedRes.headers.get("content-type") || "";

        // Extract the response body based on content type
        let responseBody: any;

        if (contentType.includes("application/json")) {
          // Handle JSON response
          responseBody = await clonedRes.json();
        }

        // Extract headers to cache
        const headers: Record<string, string> = {};
        clonedRes.headers.forEach((value, key) => {
          // Skip certain headers
          if (
            !["set-cookie", "connection", "keep-alive"].includes(
              key.toLowerCase(),
            )
          ) {
            headers[key] = value;
          }
        });

        // Store in cache
        const cacheEntry: CacheEntry = {
          body: JSON.stringify(responseBody), // Store as-is to avoid encoding issues
          headers,
          status: clonedRes.status,
          createdAt: Date.now(),
          contentType: contentType, // Store content type for proper reconstruction
        };

        await cacheStore.set(cacheKey, cacheEntry, opts.ttl!).catch((error) => {
          console.error("Cache storage error:", error);
        });
      } catch (error) {
        console.error("Error caching response:", error);
        // Continue without caching rather than failing the request
        await next();
      }
    }
  };
};
