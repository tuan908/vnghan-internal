import { createCacheMiddleware } from "./cache";
import { createDbMiddleware } from "./db";
import { createJwtMiddleware } from "./jwt";

export const MiddlewareFactory = {
  createCacheMiddleware,
  createDbMiddleware,
  createJwtMiddleware,
};
