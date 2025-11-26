import {
	boolean,
	integer,
	jsonb,
	serial,
	text,
	timestamp,
} from "drizzle-orm/pg-core";
import { pgTableWithAudit } from "../base/helpers";

const auditableFields = {
	createdBy: integer("created_by"),
	updatedBy: integer("updated_by"),
	createdAt: timestamp("created_at").defaultNow(),
	updatedAt: timestamp("updated_at").defaultNow(),
	isDeleted: boolean("is_deleted").default(false),
};

export const screwMaterial = pgTableWithAudit("screw_material", {
	id: serial("id").primaryKey(),
	name: text("name"),
	note: text("note"),
});

export const screwUnit = pgTableWithAudit("screw_unit", {
	id: serial("id").primaryKey(),
	name: text("name"),
	detail: text("detail"),
	note: text("note"),
});

export const screwType = pgTableWithAudit("screw_type", {
	id: serial("id").primaryKey(),
	name: text("name"),
	note: text("note"),
});

export const screwSize = pgTableWithAudit("screw_size", {
	id: serial("id").primaryKey(),
	name: text("name"),
	note: text("note"),
});

export const customer = pgTableWithAudit("customer", {
	id: serial("id").primaryKey(),
	name: text("name"),
	phone: text("phone"),
	address: text("address"),
	nextMessageTime: text("next_message_time"),
	note: text("note"),
	money: text("money"),
	need: text("need").default(""),
	// 🧩 Optional: Ownership / responsibility
	assignedTo: integer("assigned_to").references(() => user.id),
});

export const platform = pgTableWithAudit("platform", {
	id: serial("id").primaryKey(),
	name: text("description"),
});

export const customerPlatform = pgTableWithAudit("customer_platform", {
	id: serial("id").primaryKey(),
	customerId: integer("customer_id")
		.notNull()
		.references(() => customer.id, {
			onDelete: "cascade",
			onUpdate: "cascade",
		}),
	platformId: integer("platform_id")
		.notNull()
		.references(() => platform.id, {
			onDelete: "cascade",
			onUpdate: "cascade",
		}),
	// needId: integer("need_id")
	//   .notNull()
	//   .references(() => needs.id),

	userId: integer("user_id")
		.notNull()
		.references(() => user.id),
});

export const screw = pgTableWithAudit("screw", {
	id: serial("id").primaryKey(),
	name: text("name"),
	description: text("description"),
	componentTypeId: integer("type_id")
		.notNull()
		.references(() => screwType.id),
	sizeId: integer("size_id")
		.notNull()
		.references(() => screwSize.id),
	materialId: integer("material_id")
		.notNull()
		.references(() => screwMaterial.id),
	note: text("note"),
	price: text("price"),
	quantity: text("quantity"),
});

export const screwQuestion = pgTableWithAudit("screw_question", {
	id: serial("id").primaryKey(),
	name: text("name"),
	data: jsonb("data"),
	note: text("note"),
});

export const screwInstruction = pgTableWithAudit("screw_instruction", {
	id: serial("id").primaryKey(),
	name: text("name"),
	data: jsonb("data"),
	note: text("note"),
});

export const screwImage = pgTableWithAudit("screw_images", {
	id: serial("id").primaryKey(),
	url: text("name"),
	note: text("note"),
	screwId: integer("screw_id").references(() => screw.id),
});

export const need = pgTableWithAudit("need", {
	id: serial("id").primaryKey(),
	description: text("description"),
});

export const user = pgTableWithAudit("user", {
	id: serial("id").primaryKey(),
	username: text("username"),
	name: text("name"),
	passwordHash: text("password_hash"),
	role: text("role", { enum: ["001", "002", "003", "004"] }).default("001"), // Viewer, Editor, Owner, Administrator
});

export const excelTemplate = pgTableWithAudit("excel_template", {
	id: serial("id").primaryKey(),
	name: text("name").notNull(), // e.g. "Customer Import"
	description: text("description"), // optional
	isActive: boolean("is_active").default(true),
});

export const excelTemplateHeader = pgTableWithAudit("excel_template_header", {
	id: serial("id").primaryKey(),
	templateId: integer("template_id")
		.notNull()
		.references(() => excelTemplate.id, { onDelete: "cascade" }),

	label: text("label").notNull(), // Column title in Excel
	key: text("key").notNull(), // Corresponding field in system
	order: integer("order").notNull(), // Order in Excel
	exampleValue: text("example_value"), // Optional example
	required: boolean("required").default(false),
});
