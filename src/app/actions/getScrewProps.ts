"use server";

import { client } from "@/lib/client";
import { cache } from "react";

export const getScrewTypes = cache(async () => {
  const response = await client.screw.getScrewTypes.$get();
  return response.json();
});

export const getScrewMaterials = cache(async () => {
  const response = await client.screw.getScrewMaterials.$get();
  return response.json();
});
