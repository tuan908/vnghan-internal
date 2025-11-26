import type { AppRoute } from "@/backend";
import { hc } from "hono/client";
import { getUrl } from ".";

const client = hc<AppRoute>(getUrl());

export const honoClientV1 = client.api.v1;
export const honoClientV2 = client.api.v2;
