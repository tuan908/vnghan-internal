import { createCacheMiddleware } from "./cache";
import { createDbMiddleware } from "./db";

export const MiddlewareFactory = {
  createCacheMiddleware,
  createDbMiddleware,
};
