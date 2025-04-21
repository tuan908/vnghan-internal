import authRouterV1 from "./v1/auth.route";
import customerRouterV1 from "./v1/customer.route";
import exportRouterV1 from "./v1/export.route";
import importRouterV1 from "./v1/import.route";
import platformRouterV1 from "./v1/platform.route";
import screwRouterV1 from "./v1/screw.route";
import templateRouterV1 from "./v1/template.route";
import userRouteV1 from "./v1/user.route";
import screwRouterV2 from "./v2/screw.route";

export const Routes = {
  V1: {
    Auth: authRouterV1,
    Customers: customerRouterV1,
    Export: exportRouterV1,
    Import: importRouterV1,
    Platforms: platformRouterV1,
    Screws: screwRouterV1,
    Templates: templateRouterV1,
    Users: userRouteV1,
  },
  V2: {
    Screws: screwRouterV2,
  },
};
