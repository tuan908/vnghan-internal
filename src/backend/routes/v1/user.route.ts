import { createSuccessResponse } from "@/backend/lib/api-response";
import type { ContextVariableMap } from "@/backend/types";
import { Hono } from "hono";

const userRouteV1 = new Hono<{ Variables: ContextVariableMap }>().get(
  "/",
  async (c) => {
    const user = c.get("user");
    return c.json(createSuccessResponse(user));
  },
);

export default userRouteV1;
