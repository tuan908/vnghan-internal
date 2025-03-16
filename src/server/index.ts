import { API_VERSION } from "@/constants"
import { j } from "./jstack"
import { fileRouter } from "./routers/file-router"
import { screwRouter } from "./routers/screw-router"

/**
 * This is your base API.
 * Here, you can handle errors, not-found responses, cors and more.
 *
 * @see https://jstack.app/docs/backend/app-router
 */
const api = j
  .router()
  .basePath(API_VERSION)
  .use(j.defaults.cors)
  .onError(j.defaults.errorHandler)

/**
 * This is the main router for your server.
 * All routers in /server/routers should be added here manually.
 */
const appRouter = j.mergeRouters(api, {
  screw: screwRouter,
  file: fileRouter
})

export type AppRouter = typeof appRouter

export default appRouter
