// src/backend/database/schema/base/helpers.ts

import type { BuildExtraConfigColumns } from "drizzle-orm/column-builder";
import {
	type PgColumnBuilderBase,
	pgTable,
	type PgTableExtraConfigValue,
} from "drizzle-orm/pg-core"; // Import explicit Drizzle types
import { auditableColumns, createAuditableIndexes } from "./auditable";

// Create a function that composes audit columns with custom columns
export function pgTableWithAudit<
	TTableName extends string,
	TColumnsMap extends Record<string, PgColumnBuilderBase>,
>(
	name: TTableName,
	columns: TColumnsMap,
	extraConfig?: (
		self: BuildExtraConfigColumns<TTableName, TColumnsMap, "pg">,
	) => PgTableExtraConfigValue[],
) {
	// Create the table with merged columns
	return pgTable(`t_${name}`, { ...columns, ...auditableColumns }, (table) => {
		const auditableIndexes = createAuditableIndexes(table, `t_${name}`);
		if (!extraConfig) return [...auditableIndexes];
		return [...auditableIndexes, ...extraConfig(table)];
	});
}
