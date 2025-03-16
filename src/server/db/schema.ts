import { integer, numeric, pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";

export const screws = pgTable("t_screw", {
  id: serial("id")
    .primaryKey(),
  name: text("name").notNull(),
  type: numeric("type")
    .notNull()
    .references(() => screwTypes.id),
  size: numeric("size")
    .notNull()
    .references(() => screwSizes.id),
  material: numeric("material")
    .notNull()
    .references(() => screwMaterials.id),
  price: text("price").notNull(),
  stock: integer("stock").notNull().default(0),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const screwTypes = pgTable("t_screw_type", {
  id: serial("id")
    .primaryKey(),
  name: text("name"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const screwMaterials = pgTable("t_screw_material", {
  id: serial("id")
    .primaryKey(),
  name: text("name"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const screwSizes = pgTable("t_screw_size", {
  id: serial("id")
    .primaryKey(),
  name: text("name"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

const schema = {
  screws,
  screwTypes,
  screwMaterials,
  screwSizes,
};

export default schema;
