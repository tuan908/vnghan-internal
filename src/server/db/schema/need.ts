import { serial, text } from "drizzle-orm/pg-core";
import { pgTableWithAudit } from "../base/helpers";

export const need = pgTableWithAudit("need", {
	id: serial("id").primaryKey(),
	description: text("description"),
});
