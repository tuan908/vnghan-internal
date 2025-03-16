import { ErrorCodes } from "@/constants";
import json from "@/i18n/locales/vi.json";
import { createErrorResponse } from "@/lib/api-response";
import { dynamic } from "jstack";
import { j } from "./jstack";

/**
 * This is your base API.
 * Here, you can handle errors, not-found responses, cors and more.
 *
 * @see https://jstack.app/docs/backend/app-router
 */
const api = j
  .router()
  .basePath("/api")
  .use(j.defaults.cors)
  .onError((_, c) => {
    return c.json(
      createErrorResponse({
        code: ErrorCodes.INTERNAL_SERVER_ERROR,
        message: json.error.internalServerError,
        statusCode: 500,
      })
    );
  });

/**
 * This is the main router for your server.
 * All routers in /server/routers should be added here manually.
 */
const appRouter = j.mergeRouters(api, {
  screw: dynamic(() => import("./routers/screw-router")),
  file: dynamic(() => import("./routers/file-router")),
});

export type AppRouter = typeof appRouter;

export default appRouter;
