import { serial, text } from "drizzle-orm/pg-core";
import { pgTableWithAudit } from "../base/helpers";

export const user = pgTableWithAudit("user", {
	id: serial("id").primaryKey(),
	username: text("username"),
	name: text("name"),
	passwordHash: text("password_hash"),
	role: text("role", { enum: ["001", "002", "003", "004"] }).default("001"), // Viewer, Editor, Owner, Administrator
});
