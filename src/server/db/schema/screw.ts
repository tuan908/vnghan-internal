import { integer, jsonb, serial, text } from "drizzle-orm/pg-core";
import { pgTableWithAudit } from "../base/helpers";

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
