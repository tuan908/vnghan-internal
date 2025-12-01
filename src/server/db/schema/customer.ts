import { integer, serial, text } from "drizzle-orm/pg-core";
import { pgTableWithAudit } from "../base/helpers";
import { platform } from "./platform";
import { user } from "./user";

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
