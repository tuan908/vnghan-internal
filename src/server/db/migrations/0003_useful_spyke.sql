ALTER TABLE "t_customer" DROP CONSTRAINT "t_customer_created_by_t_user_id_fk";
--> statement-breakpoint
ALTER TABLE "t_customer" DROP CONSTRAINT "t_customer_updated_by_t_user_id_fk";
--> statement-breakpoint
ALTER TABLE "t_customer_platform" ADD COLUMN "created_by" integer;--> statement-breakpoint
ALTER TABLE "t_customer_platform" ADD COLUMN "updated_by" integer;--> statement-breakpoint
ALTER TABLE "t_excel_template" ADD COLUMN "created_by" integer;--> statement-breakpoint
ALTER TABLE "t_excel_template" ADD COLUMN "updated_by" integer;--> statement-breakpoint
ALTER TABLE "t_excel_template_header" ADD COLUMN "created_by" integer;--> statement-breakpoint
ALTER TABLE "t_excel_template_header" ADD COLUMN "updated_by" integer;--> statement-breakpoint
ALTER TABLE "t_need" ADD COLUMN "created_by" integer;--> statement-breakpoint
ALTER TABLE "t_need" ADD COLUMN "updated_by" integer;--> statement-breakpoint
ALTER TABLE "t_platform" ADD COLUMN "created_by" integer;--> statement-breakpoint
ALTER TABLE "t_platform" ADD COLUMN "updated_by" integer;--> statement-breakpoint
ALTER TABLE "t_screw" ADD COLUMN "created_by" integer;--> statement-breakpoint
ALTER TABLE "t_screw" ADD COLUMN "updated_by" integer;--> statement-breakpoint
ALTER TABLE "t_screw_images" ADD COLUMN "created_by" integer;--> statement-breakpoint
ALTER TABLE "t_screw_images" ADD COLUMN "updated_by" integer;--> statement-breakpoint
ALTER TABLE "t_screw_instruction" ADD COLUMN "created_by" integer;--> statement-breakpoint
ALTER TABLE "t_screw_instruction" ADD COLUMN "updated_by" integer;--> statement-breakpoint
ALTER TABLE "t_screw_material" ADD COLUMN "created_by" integer;--> statement-breakpoint
ALTER TABLE "t_screw_material" ADD COLUMN "updated_by" integer;--> statement-breakpoint
ALTER TABLE "t_screw_question" ADD COLUMN "created_by" integer;--> statement-breakpoint
ALTER TABLE "t_screw_question" ADD COLUMN "updated_by" integer;--> statement-breakpoint
ALTER TABLE "t_screw_size" ADD COLUMN "created_by" integer;--> statement-breakpoint
ALTER TABLE "t_screw_size" ADD COLUMN "updated_by" integer;--> statement-breakpoint
ALTER TABLE "t_screw_type" ADD COLUMN "created_by" integer;--> statement-breakpoint
ALTER TABLE "t_screw_type" ADD COLUMN "updated_by" integer;--> statement-breakpoint
ALTER TABLE "t_screw_unit" ADD COLUMN "created_by" integer;--> statement-breakpoint
ALTER TABLE "t_screw_unit" ADD COLUMN "updated_by" integer;--> statement-breakpoint
ALTER TABLE "t_user" ADD COLUMN "name" text;--> statement-breakpoint
ALTER TABLE "t_user" ADD COLUMN "created_by" integer;--> statement-breakpoint
ALTER TABLE "t_user" ADD COLUMN "updated_by" integer;