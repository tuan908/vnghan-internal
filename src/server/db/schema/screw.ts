import { relations } from "drizzle-orm";
import { boolean, integer, pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";
import { screwMaterials } from "./material";
import { screwSizes } from "./size";
import { screwTypes } from "./type";

export const screws = pgTable("t_screw", {
  id: serial("id").primaryKey(),
  name: text("name"),
  description: text("description"),
  type: integer("type")
    .notNull()
    .references(() => screwTypes.id),
  size: integer("size")
    .notNull()
    .references(() => screwSizes.id),
  material: integer("material")
    .notNull()
    .references(() => screwMaterials.id),
  note: text("note"),
  price: text("price"),
  stock: text("stock"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
  isDeleted: boolean("is_deleted").default(false),
});

export const screwRelations = relations(screws, ({ one }) => ({
    type: one(screwTypes, {
      fields: [screws.type],
      references: [screwTypes.id],
      relationName: "type",
    }),
    size: one(screwSizes, {
      fields: [screws.size],
      references: [screwSizes.id],
      relationName: "size",
    }),
    material: one(screwMaterials, {
      fields: [screws.type],
      references: [screwMaterials.id],
      relationName: "material",
    }),
  }));