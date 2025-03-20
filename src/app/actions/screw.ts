"use server";

import { getApiUrl } from "@/lib/utils";
import type { ScrewDto } from "@/lib/validations";
import type { ApiResponse, ScrewMaterialDto, ScrewTypeDto } from "@/types";
import { cache } from "react";

export const getScrewTypes = cache(async () => {
  const response = await fetch(`${getApiUrl()}/screws/types`);
  return response.json<ApiResponse<ScrewTypeDto[]>>();
});

export const getScrewMaterials = cache(async () => {
  const response = await fetch(`${getApiUrl()}/screws/materials`);
  return response.json<ApiResponse<ScrewMaterialDto[]>>();
});

export const getAllScrews = async ({ page }: { page: number }) => {
  const response = await fetch(`${getApiUrl()}/screws?page=${page}`);
  return response.json<ApiResponse<ScrewDto[]>>();
};

export const createScrew = async (screwDto: ScrewDto) => {
  const response = await fetch(`${getApiUrl()}/screws}`, {
    body: JSON.stringify(screwDto),
    method: "post",
  });
  return response.json<ApiResponse<ScrewDto[]>>();
};

export const editScrew = async (screwDto: ScrewDto) => {
  const response = await fetch(`${getApiUrl()}/screws/${screwDto.id}`, {
    body: JSON.stringify(screwDto),
    method: "patch",
  });
  return response.json<ApiResponse<ScrewDto[]>>();
};

export const deleteScrew = async (screwDto: ScrewDto) => {
  const response = await fetch(`${getApiUrl()}/screws/${screwDto.id}`, {
    body: JSON.stringify(screwDto),
    method: "delete",
  });
  return response.json<ApiResponse<ScrewDto[]>>();
};
