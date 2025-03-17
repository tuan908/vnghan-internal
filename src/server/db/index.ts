import { screwMaterials } from "./schema/material";
import { screws } from "./schema/screw";
import { screwSizes } from "./schema/size";
import { screwTypes } from "./schema/type";

export default {
  screw: screws,
  screwType: screwTypes,
  screwSize: screwSizes,
  screwMaterial: screwMaterials
}