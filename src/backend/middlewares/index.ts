import { createCacheMiddleware } from "./cache.middleware";
import { createDbMiddleware } from "./db.middleware";
import { createJwtMiddleware } from "./jwt.middleware";
import { createRateLimitMiddleware } from "./rate-limit.middleware";

export const MiddlewareFactory = {
  createCacheMiddleware,
  createDbMiddleware,
  createJwtMiddleware,
  createRateLimitMiddleware,
};
