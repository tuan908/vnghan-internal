ALTER TABLE "t_excel_template" RENAME TO "t_import_template";--> statement-breakpoint
ALTER TABLE "t_excel_template_header" RENAME TO "t_import_template_header";--> statement-breakpoint
ALTER TABLE "t_import_template_header" DROP CONSTRAINT "t_excel_template_header_template_id_t_excel_template_id_fk";
--> statement-breakpoint
DROP INDEX "idx_deleted_at_t_excel_template";--> statement-breakpoint
DROP INDEX "idx_created_at_t_excel_template";--> statement-breakpoint
DROP INDEX "idx_created_by_at_t_excel_template";--> statement-breakpoint
DROP INDEX "idx_deleted_at_t_excel_template_header";--> statement-breakpoint
DROP INDEX "idx_created_at_t_excel_template_header";--> statement-breakpoint
DROP INDEX "idx_created_by_at_t_excel_template_header";--> statement-breakpoint
ALTER TABLE "t_import_template_header" ADD CONSTRAINT "t_import_template_header_template_id_t_import_template_id_fk" FOREIGN KEY ("template_id") REFERENCES "public"."t_import_template"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_deleted_at_t_import_template" ON "t_import_template" USING btree ("deleted_at");--> statement-breakpoint
CREATE INDEX "idx_created_at_t_import_template" ON "t_import_template" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "idx_created_by_at_t_import_template" ON "t_import_template" USING btree ("created_by","created_at");--> statement-breakpoint
CREATE INDEX "idx_deleted_at_t_import_template_header" ON "t_import_template_header" USING btree ("deleted_at");--> statement-breakpoint
CREATE INDEX "idx_created_at_t_import_template_header" ON "t_import_template_header" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "idx_created_by_at_t_import_template_header" ON "t_import_template_header" USING btree ("created_by","created_at");