CREATE INDEX "idx_screw_material_type" ON "t_screw" USING btree ("material_id","type_id");--> statement-breakpoint
CREATE INDEX "idx_screw_material_name" ON "t_screw_material" USING btree ("name");--> statement-breakpoint
CREATE INDEX "idx_screw_type_name" ON "t_screw_type" USING btree ("name");