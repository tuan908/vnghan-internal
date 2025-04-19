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

export const ScrewMaterial = pgTable("t_screw_material", {
  id: serial("id").primaryKey(),
  name: text("name"),
  note: text("note"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
  isDeleted: boolean("is_deleted").default(false),
});

export const ScrewUnit = pgTable("t_screw_unit", {
  id: serial("id").primaryKey(),
  name: text("name"),
  detail: text("detail"),
  note: text("note"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
  isDeleted: boolean("is_deleted").default(false),
});

export const ScrewType = pgTable("t_screw_type", {
  id: serial("id").primaryKey(),
  name: text("name"),
  note: text("note"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
  isDeleted: boolean("is_deleted").default(false),
});

export const ScrewSize = pgTable("t_screw_size", {
  id: serial("id").primaryKey(),
  name: text("name"),
  note: text("note"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
  isDeleted: boolean("is_deleted").default(false),
});

export const Customer = pgTable("t_customer", {
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
  need: text("need").default(""),
  // ✅ Audit fields
  createdBy: integer("created_by").references(() => User.id),
  updatedBy: integer("updated_by").references(() => User.id),

  // 🧩 Optional: Ownership / responsibility
  assignedTo: integer("assigned_to").references(() => User.id),
});

export const Platform = pgTable("t_platform", {
  id: serial("id").primaryKey(),
  description: text("description"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
  isDeleted: boolean("is_deleted").default(false),
});

export const CustomerPlatform = pgTable("t_customer_platform", {
  id: serial("id").primaryKey(),
  customerId: integer("customer_id")
    .notNull()
    .references(() => Customer.id, {
      onDelete: "cascade",
      onUpdate: "cascade",
    }),
  platformId: integer("platform_id")
    .notNull()
    .references(() => Platform.id, {
      onDelete: "cascade",
      onUpdate: "cascade",
    }),
  // needId: integer("need_id")
  //   .notNull()
  //   .references(() => needs.id),

  userId: integer("user_id")
    .notNull()
    .references(() => User.id),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
  isDeleted: boolean("is_deleted").default(false),
});

export const Screw = pgTable("t_screw", {
  id: serial("id").primaryKey(),
  name: text("name"),
  description: text("description"),
  componentTypeId: integer("type_id")
    .notNull()
    .references(() => ScrewType.id),
  sizeId: integer("size_id")
    .notNull()
    .references(() => ScrewSize.id),
  materialId: integer("material_id")
    .notNull()
    .references(() => ScrewMaterial.id),
  note: text("note"),
  price: text("price"),
  quantity: text("quantity"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
  isDeleted: boolean("is_deleted").default(false),
});

export const ScrewQuestion = pgTable("t_screw_question", {
  id: serial("id").primaryKey(),
  name: text("name"),
  data: jsonb("data"),
  note: text("note"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
  isDeleted: boolean("is_deleted").default(false),
});

export const ScrewInstruction = pgTable("t_screw_instruction", {
  id: serial("id").primaryKey(),
  name: text("name"),
  data: jsonb("data"),
  note: text("note"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
  isDeleted: boolean("is_deleted").default(false),
});

export const ScrewImage = pgTable("t_screw_images", {
  id: serial("id").primaryKey(),
  url: text("name"),
  note: text("note"),
  screwId: integer("screw_id").references(() => Screw.id),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
  isDeleted: boolean("is_deleted").default(false),
});

export const Need = pgTable("t_need", {
  id: serial("id").primaryKey(),
  description: text("description"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
  isDeleted: boolean("is_deleted").default(false),
});

export const User = pgTable("t_user", {
  id: serial("id").primaryKey(),
  username: text("username"),
  passwordHash: text("password_hash"),
  role: text("role", { enum: ["001", "002", "003", "004"] }).default("001"), // Viewer, Editor, Owner, Administrator
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
  isDeleted: boolean("is_deleted").default(false),
});

export const ExcelTemplate = pgTable("t_excel_template", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(), // e.g. "Customer Import"
  description: text("description"), // optional
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
  isDeleted: boolean("is_deleted").default(false),
});

export const ExcelTemplateHeader = pgTable("t_excel_template_header", {
  id: serial("id").primaryKey(),
  templateId: integer("template_id")
    .notNull()
    .references(() => ExcelTemplate.id, { onDelete: "cascade" }),

  label: text("label").notNull(), // Column title in Excel
  key: text("key").notNull(), // Corresponding field in system
  order: integer("order").notNull(), // Order in Excel
  exampleValue: text("example_value"), // Optional example
  required: boolean("required").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
  isDeleted: boolean("is_deleted").default(false),
});

const DbSchema = {
  Customer,
  CustomerPlatform,
  Need,
  Platform,
  Screw,
  ScrewImage,
  ScrewInstruction,
  ScrewMaterial,
  ScrewQuestion,
  ScrewSize,
  ScrewType,
  ScrewUnit,
  User,
  ExcelTemplate,
  ExcelTemplateHeader,
};

export { DbSchema };
export type ScrewEntity = Omit<typeof Screw.$inferSelect, "id">;
export type CreateScrewDto = RecursivelyReplaceNullWithUndefined<
  typeof Screw.$inferInsert
>;

// export type NeedDto = Omit<
//   RecursivelyReplaceNullWithUndefined<typeof DbSchema.Need.$inferSelect>,
//   "createdAt" | "updatedAt" | "isDeleted"
// >;

export type PlatformDto = Omit<
  RecursivelyReplaceNullWithUndefined<typeof Platform.$inferSelect>,
  "createdAt" | "updatedAt" | "isDeleted"
>;
