// src/backend/database/schema/base/auditable.ts
import type { BuildExtraConfigColumns } from "drizzle-orm";
import {
	index,
	integer,
	type PgColumnBuilderBase,
	text,
	timestamp,
} from "drizzle-orm/pg-core";

// src/backend/database/schema/base/types.ts

// Audit context for tracking who made changes
export interface AuditContext {
	userId?: string;
	requestId?: string;
	ipAddress?: string;
	userAgent?: string;
}

// Type representing the actual data values for auditable columns
export type AuditableData = {
	createdAt: Date;
	createdBy: string | null; // UUIDs are stored as strings, or null if not set
	updatedAt: Date;
	updatedBy: string | null;
	deletedAt: Date | null;
	deletedBy: string | null;
	version: number;
};

// Base audit fields interface (as previously)
export interface AuditableFields {
	createdAt: Date;
	createdBy?: string | null;
	updatedAt: Date;
	updatedBy?: string | null;
	deletedAt?: Date | null;
	deletedBy?: string | null;
	version: number;
}

// Define audit columns that will be added to every table
export const auditableColumns = {
	// Timestamps
	createdAt: timestamp("created_at", { withTimezone: true })
		.notNull()
		.defaultNow(),

	updatedAt: timestamp("updated_at", { withTimezone: true })
		.notNull()
		.defaultNow()
		.$onUpdate(() => new Date()), // Drizzle's built-in update trigger

	deletedAt: timestamp("deleted_at", { withTimezone: true }),

	// User tracking (optional - can be foreign keys)
	createdBy: text("created_by"),
	updatedBy: text("updated_by"),
	deletedBy: text("deleted_by"),

	// Optimistic locking version
	version: integer("version").notNull().default(1),
};

// SQL functions for advanced features
// export const auditableSQLHelpers = {
// 	// For soft delete checks
// 	isNotDeleted: (table: any) => sql`${table.deletedAt} IS NULL`,

// 	// For versioning
// 	incrementVersion: (table: any) => sql`${table.version} + 1`,

// 	// For timestamp updates (if not using Drizzle's $onUpdate)
// 	updateTimestamp: () => sql`NOW()`,
// };

// Default indexes for audit fields
export const createAuditableIndexes = <
	TTableName extends string,
	TColumnsMap extends Record<string, PgColumnBuilderBase> &
		typeof auditableColumns,
>(
	table: BuildExtraConfigColumns<TTableName, TColumnsMap, "pg">,
	tableName: string,
) => [
	// Index for soft deletes
	index(`idx_deleted_at_${tableName}`).on(table.deletedAt),
	// Index for created timestamp queries
	index(`idx_created_at_${tableName}`).on(table.createdAt),
	// Composite index for user activity tracking
	index(`idx_created_by_at_${tableName}`).on(table.createdBy, table.createdAt),
];
