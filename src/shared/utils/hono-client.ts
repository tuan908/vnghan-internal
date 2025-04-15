import type { AppRoute } from "@/backend";
import { hc } from "hono/client";
import { getUrl } from ".";

export const client = hc<AppRoute>(getUrl());
