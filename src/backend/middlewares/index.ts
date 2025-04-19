import { createCacheMiddleware } from "./cache";
import { createDbMiddleware } from "./db";
import { createJwtMiddleware } from "./jwt";
import { createRateLimitMiddleware } from "./rate-limit";

export const MiddlewareFactory = {
  createCacheMiddleware,
  createDbMiddleware,
  createJwtMiddleware,
  createRateLimitMiddleware,
};
