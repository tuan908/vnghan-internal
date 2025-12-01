import { serial, text } from "drizzle-orm/pg-core";
import { pgTableWithAudit } from "../base/helpers";

export const platform = pgTableWithAudit("platform", {
	id: serial("id").primaryKey(),
	name: text("description"),
});
