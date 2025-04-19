import { createSuccessResponse } from "@/shared/utils/api-response";
import { Hono } from "hono";

const userRouteV1 = new Hono().get("/", async (c) => {
  const user = c.get("user");
  return c.json(createSuccessResponse(user));
});

export default userRouteV1;
