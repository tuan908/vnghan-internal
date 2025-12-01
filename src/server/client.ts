import type { AppRoute } from "@/server";
import { hc } from "hono/client";
import { getUrl } from "../core/utils";

const client = hc<AppRoute>(getUrl());
export const api = client.api;
