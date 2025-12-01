import { boolean, integer, serial, text } from "drizzle-orm/pg-core";
import { pgTableWithAudit } from "../base/helpers";

export const importTemplate = pgTableWithAudit("import_template", {
	id: serial("id").primaryKey(),
	name: text("name").notNull(), // e.g. "Customer Import"
	description: text("description"), // optional
	isActive: boolean("is_active").default(true),
});

export const importTemplateHeader = pgTableWithAudit("import_template_header", {
	id: serial("id").primaryKey(),
	templateId: integer("template_id")
		.notNull()
		.references(() => importTemplate.id, { onDelete: "cascade" }),

	label: text("label").notNull(), // Column title in Excel
	key: text("key").notNull(), // Corresponding field in system
	order: integer("order").notNull(), // Order in Excel
	exampleValue: text("example_value"), // Optional example
	required: boolean("required").default(false),
});
