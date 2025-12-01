import { createSuccessResponse } from "@/server/lib/api-response";
import { Hono } from "hono";

const userRouter = new Hono().get(
	"/",
	async (c) => {
		const user = c.get("session");
		return c.json(createSuccessResponse(user));
	},
);

export default userRouter;
