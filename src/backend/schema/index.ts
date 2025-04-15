import { RecursivelyReplaceNullWithUndefined } from "@/shared/types";
import { screwMaterials } from "./material";
import { screws } from "./screw";
import { screwSizes } from "./size";
import { screwTypes } from "./type";

const DbSchema = {
  Screw: screws,
  ScrewType: screwTypes,
  ScrewSize: screwSizes,
  ScrewMaterial: screwMaterials,
};

export default DbSchema;

export type TScrewEntity = Omit<typeof DbSchema.Screw.$inferSelect, "id">;
export type TServerCreateScrewDto = RecursivelyReplaceNullWithUndefined<
  typeof DbSchema.Screw.$inferInsert
>;
