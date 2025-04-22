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
  const defaultFileOptions = {
    maxFileSizeBytes: 5 * 1024 * 1024, // 5MB default limit
    cacheableFileTypes: [
      "application/pdf",
      "image/jpeg",
      "image/png",
      "image/gif",
      "image/webp",
      "text/csv",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "application/vnd.ms-excel",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "application/msword",
      "application/zip",
    ],
    compressFiles: true,
  };

  const opts = {
    ...defaultOptions,
    ...defaultFileOptions,
    ...options,
  };

  return async (c: Context, next: Next) => {
    const { REDIS_URL, REDIS_TOKEN } = opts;
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
    const cachedEntry = (await cacheStore.get(cacheKey)) as CacheEntry;

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

      c.header("Content-Type", cachedEntry.contentType);

      // Handle file vs JSON response
      if (cachedEntry.isFile && cachedEntry.fileData) {
        // For file responses, decode the base64 file data
        let fileBuffer = Buffer.from(cachedEntry.fileData, "base64");

        // If compression is enabled, decompress the data
        if (opts.compressFiles && cachedEntry.compressed) {
          try {
            const zlib = await import("zlib");
            const util = await import("util");
            const inflate = util.promisify<Buffer, Buffer>((input, callback) =>
              zlib.inflate(input, callback),
            );
            const decompressedBuffer = await inflate(fileBuffer);
            fileBuffer = Buffer.from(decompressedBuffer);
          } catch (error) {
            console.error("Error decompressing file data:", error);
            // Continue with the compressed data as fallback
          }
        }

        return c.body(fileBuffer, cachedEntry.status as ContentfulStatusCode);
      } else {
        // For JSON responses, use the existing logic
        const decodedBody = JSON.parse(cachedEntry.body) as ApiResponse;
        const actualResponseBody = {
          ...decodedBody,
          timestamp: generateTimestamp(),
          requestId: generateRequestId(),
        };
        return c.json(
          actualResponseBody,
          cachedEntry.status as ContentfulStatusCode,
        );
      }
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

        const cacheEntry: CacheEntry = {
          headers,
          status: clonedRes.status,
          createdAt: Date.now(),
          contentType: contentType,
          body: "", // Will be populated based on content type
        };

        // Handle different content types
        if (contentType.includes("application/json")) {
          // Handle JSON response
          const responseBody = await clonedRes.json();
          cacheEntry.body = JSON.stringify(responseBody);
          cacheEntry.isFile = false;
        }
        // Check if this is a file type we want to cache
        else if (
          opts.cacheableFileTypes.some((type) => contentType.includes(type))
        ) {
          // Get file size from content-length header if available
          const contentLength = parseInt(
            clonedRes.headers.get("content-length") || "0",
          );

          // Skip caching if file is too large
          if (contentLength > 0 && contentLength > opts.maxFileSizeBytes) {
            console.log(
              `File too large to cache (${contentLength} bytes), skipping cache`,
            );
            return;
          }

          // Handle file response
          const fileBuffer = await clonedRes.arrayBuffer();
          const fileData = Buffer.from(fileBuffer);

          // Skip caching if file size exceeds limit
          if (fileData.length > opts.maxFileSizeBytes) {
            console.log(
              `File too large to cache (${fileData.length} bytes), skipping cache`,
            );
            return;
          }

          // Apply compression if enabled
          if (opts.compressFiles) {
            try {
              const zlib = await import("zlib");
              const util = await import("util");
              const deflate = util.promisify(zlib.deflate);
              const compressedData = await deflate(fileData);
              cacheEntry.fileData = compressedData.toString("base64");
              cacheEntry.compressed = true;
            } catch (error) {
              console.error("Error compressing file data:", error);
              // Fall back to uncompressed data
              cacheEntry.fileData = fileData.toString("base64");
              cacheEntry.compressed = false;
            }
          } else {
            cacheEntry.fileData = fileData.toString("base64");
            cacheEntry.compressed = false;
          }

          cacheEntry.isFile = true;
          cacheEntry.body = ""; // Not used for files
        }
        // For other content types, don't cache the body
        else {
          // For other content types, just store minimal info
          cacheEntry.body = "";
          cacheEntry.isFile = false;
        }

        // Store in cache if we have content to cache
        if (cacheEntry.isFile === true || cacheEntry.body) {
          await cacheStore
            .set(cacheKey, cacheEntry, opts.ttl!)
            .catch((error) => {
              console.error("Cache storage error:", error);
            });
        }
      } catch (error) {
        console.error("Error caching response:", error);
        // Continue without caching rather than failing the request
      }
    }
  };
};
