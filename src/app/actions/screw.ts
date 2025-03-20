"use server";

import API from "@/lib/client";
import type { ScrewDto } from "@/lib/validations";
import type { ApiResponse, ScrewMaterialDto, ScrewTypeDto } from "@/types";
import { cache } from "react";

export const getScrewTypes = cache(
  async (): Promise<ApiResponse<ScrewTypeDto[]> | undefined> => {
    return await API.get<ApiResponse<ScrewTypeDto[]>>(`/screws/types`);
  }
);

export const getScrewMaterials = cache(
  async (): Promise<ApiResponse<ScrewMaterialDto[]> | undefined> => {
    return await API.get<ApiResponse<ScrewMaterialDto[]>>(`/screws/materials`);
  }
);

export const getAllScrews = async (): Promise<ApiResponse<ScrewDto[]> | undefined> => {
  return await API.get<ApiResponse<ScrewDto[]>>(`/screws`);
};

export const createScrew = async (
  screwDto: ScrewDto
): Promise<ApiResponse<ScrewDto[]> | undefined> => {
  return await API.post(`/screws`, screwDto);
};

export const editScrew = async (
  screwDto: ScrewDto
): Promise<ApiResponse<ScrewDto[]> | undefined> => {
  return await API.patch(`/screws/${screwDto.id}`, screwDto);
};

export const deleteScrew = async (
  screwDto: ScrewDto
): Promise<ApiResponse<ScrewDto[]> | undefined> => {
  return await API.delete(`/screws/${screwDto.id}`, screwDto);
};
