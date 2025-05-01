import { createSuccessResponse } from "@/backend/lib/api-response";
import { Hono } from "hono";

const platformRouterV1 = new Hono().get("/", async (c) => {
	const platformRepository = c.get("platformRepository");
	const platforms = await platformRepository.findAll();
	return c.json(createSuccessResponse(platforms));
});

export default platformRouterV1;
