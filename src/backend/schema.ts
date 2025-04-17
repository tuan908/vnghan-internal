import type { RecursivelyReplaceNullWithUndefined } from "@/shared/types";
import {
  boolean,
  integer,
  jsonb,
  pgTable,
  serial,
  text,
  timestamp,
} from "drizzle-orm/pg-core";

const screwMaterials = pgTable("t_screw_material", {
  id: serial("id").primaryKey(),
  name: text("name"),
  note: text("note"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
  isDeleted: boolean("is_deleted").default(false),
});

const screwUnits = pgTable("t_screw_unit", {
  id: serial("id").primaryKey(),
  name: text("name"),
  detail: text("detail"),
  note: text("note"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
  isDeleted: boolean("is_deleted").default(false),
});

const screwTypes = pgTable("t_screw_type", {
  id: serial("id").primaryKey(),
  name: text("name"),
  note: text("note"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
  isDeleted: boolean("is_deleted").default(false),
});

const screwSizes = pgTable("t_screw_size", {
  id: serial("id").primaryKey(),
  name: text("name"),
  note: text("note"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
  isDeleted: boolean("is_deleted").default(false),
});

export const customers = pgTable("t_customer", {
  id: serial("id").primaryKey(),
  name: text("name"),
  phone: text("phone"),
  address: text("address"),
  nextMessageTime: text("next_message_time"),
  note: text("note"),
  money: text("money"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
  isDeleted: boolean("is_deleted").default(false),
  // ✅ Audit fields
  createdBy: integer("created_by").references(() => users.id),
  updatedBy: integer("updated_by").references(() => users.id),

  // 🧩 Optional: Ownership / responsibility
  assignedTo: integer("assigned_to").references(() => users.id),
});

export const platforms = pgTable("t_platform", {
  id: serial("id").primaryKey(),
  description: text("description"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
  isDeleted: boolean("is_deleted").default(false),
});

export const customersPlatforms = pgTable("t_customer_platform", {
  id: serial("id").primaryKey(),
  customerId: integer("customer_id")
    .notNull()
    .references(() => customers.id),
  platformId: integer("platform_id")
    .notNull()
    .references(() => platforms.id),
  needId: integer("need_id")
    .notNull()
    .references(() => needs.id),

  userId: integer("user_id")
    .notNull()
    .references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
  isDeleted: boolean("is_deleted").default(false),
});

const screws = pgTable("t_screw", {
  id: serial("id").primaryKey(),
  name: text("name"),
  description: text("description"),
  componentTypeId: integer("type_id")
    .notNull()
    .references(() => screwTypes.id),
  sizeId: integer("size_id")
    .notNull()
    .references(() => screwSizes.id),
  materialId: integer("material_id")
    .notNull()
    .references(() => screwMaterials.id),
  note: text("note"),
  price: text("price"),
  quantity: text("quantity"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
  isDeleted: boolean("is_deleted").default(false),
});

const screwQuestions = pgTable("t_screw_question", {
  id: serial("id").primaryKey(),
  name: text("name"),
  data: jsonb("data"),
  note: text("note"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
  isDeleted: boolean("is_deleted").default(false),
});

const screwInstructions = pgTable("t_screw_instruction", {
  id: serial("id").primaryKey(),
  name: text("name"),
  data: jsonb("data"),
  note: text("note"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
  isDeleted: boolean("is_deleted").default(false),
});

const screwImages = pgTable("t_screw_images", {
  id: serial("id").primaryKey(),
  url: text("name"),
  note: text("note"),
  screwId: integer("screw_id").references(() => screws.id),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
  isDeleted: boolean("is_deleted").default(false),
});

export const needs = pgTable("t_need", {
  id: serial("id").primaryKey(),
  description: text("description"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
  isDeleted: boolean("is_deleted").default(false),
});

export const users = pgTable("t_user", {
  id: serial("id").primaryKey(),
  username: text("username"),
  passwordHash: text("password_hash"),
  role: text("role", {enum: ["001", "002", "003", "004"]}).default("001"), // Viewer, Editor, Owner, Administrator
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
  isDeleted: boolean("is_deleted").default(false),
});

const DbSchema = {
  Screw: screws,
  ScrewType: screwTypes,
  ScrewSize: screwSizes,
  ScrewQuestion: screwQuestions,
  ScrewMaterial: screwMaterials,
  ScrewImages: screwImages,
  ScrewInstruction: screwInstructions,
  ScrewUnit: screwUnits,
  Customer: customers,
  CustomersPlatforms: customersPlatforms,
  Platform: platforms,
  Need: needs,
  User: users,
};

export default DbSchema;

export type ScrewEntity = Omit<typeof DbSchema.Screw.$inferSelect, "id">;
export type CreateScrewDto = RecursivelyReplaceNullWithUndefined<
  typeof DbSchema.Screw.$inferInsert
>;

export type NeedDto = Omit<
  RecursivelyReplaceNullWithUndefined<typeof DbSchema.Need.$inferSelect>,
  "createdAt" | "updatedAt" | "isDeleted"
>;

export type PlatformDto = Omit<
  RecursivelyReplaceNullWithUndefined<typeof DbSchema.Platform.$inferSelect>,
  "createdAt" | "updatedAt" | "isDeleted"
>;
