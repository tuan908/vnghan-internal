ALTER TABLE "t_customer" ALTER COLUMN "created_by" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "t_customer" ALTER COLUMN "updated_by" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "t_customer" ALTER COLUMN "created_at" SET DATA TYPE timestamp with time zone;--> statement-breakpoint
ALTER TABLE "t_customer" ALTER COLUMN "created_at" SET DEFAULT now();--> statement-breakpoint
ALTER TABLE "t_customer" ALTER COLUMN "created_at" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "t_customer" ALTER COLUMN "updated_at" SET DATA TYPE timestamp with time zone;--> statement-breakpoint
ALTER TABLE "t_customer" ALTER COLUMN "updated_at" SET DEFAULT now();--> statement-breakpoint
ALTER TABLE "t_customer" ALTER COLUMN "updated_at" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "t_customer_platform" ALTER COLUMN "created_by" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "t_customer_platform" ALTER COLUMN "updated_by" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "t_customer_platform" ALTER COLUMN "created_at" SET DATA TYPE timestamp with time zone;--> statement-breakpoint
ALTER TABLE "t_customer_platform" ALTER COLUMN "created_at" SET DEFAULT now();--> statement-breakpoint
ALTER TABLE "t_customer_platform" ALTER COLUMN "created_at" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "t_customer_platform" ALTER COLUMN "updated_at" SET DATA TYPE timestamp with time zone;--> statement-breakpoint
ALTER TABLE "t_customer_platform" ALTER COLUMN "updated_at" SET DEFAULT now();--> statement-breakpoint
ALTER TABLE "t_customer_platform" ALTER COLUMN "updated_at" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "t_excel_template" ALTER COLUMN "created_by" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "t_excel_template" ALTER COLUMN "updated_by" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "t_excel_template" ALTER COLUMN "created_at" SET DATA TYPE timestamp with time zone;--> statement-breakpoint
ALTER TABLE "t_excel_template" ALTER COLUMN "created_at" SET DEFAULT now();--> statement-breakpoint
ALTER TABLE "t_excel_template" ALTER COLUMN "created_at" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "t_excel_template" ALTER COLUMN "updated_at" SET DATA TYPE timestamp with time zone;--> statement-breakpoint
ALTER TABLE "t_excel_template" ALTER COLUMN "updated_at" SET DEFAULT now();--> statement-breakpoint
ALTER TABLE "t_excel_template" ALTER COLUMN "updated_at" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "t_excel_template_header" ALTER COLUMN "created_by" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "t_excel_template_header" ALTER COLUMN "updated_by" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "t_excel_template_header" ALTER COLUMN "created_at" SET DATA TYPE timestamp with time zone;--> statement-breakpoint
ALTER TABLE "t_excel_template_header" ALTER COLUMN "created_at" SET DEFAULT now();--> statement-breakpoint
ALTER TABLE "t_excel_template_header" ALTER COLUMN "created_at" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "t_excel_template_header" ALTER COLUMN "updated_at" SET DATA TYPE timestamp with time zone;--> statement-breakpoint
ALTER TABLE "t_excel_template_header" ALTER COLUMN "updated_at" SET DEFAULT now();--> statement-breakpoint
ALTER TABLE "t_excel_template_header" ALTER COLUMN "updated_at" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "t_need" ALTER COLUMN "created_by" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "t_need" ALTER COLUMN "updated_by" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "t_need" ALTER COLUMN "created_at" SET DATA TYPE timestamp with time zone;--> statement-breakpoint
ALTER TABLE "t_need" ALTER COLUMN "created_at" SET DEFAULT now();--> statement-breakpoint
ALTER TABLE "t_need" ALTER COLUMN "created_at" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "t_need" ALTER COLUMN "updated_at" SET DATA TYPE timestamp with time zone;--> statement-breakpoint
ALTER TABLE "t_need" ALTER COLUMN "updated_at" SET DEFAULT now();--> statement-breakpoint
ALTER TABLE "t_need" ALTER COLUMN "updated_at" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "t_platform" ALTER COLUMN "created_by" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "t_platform" ALTER COLUMN "updated_by" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "t_platform" ALTER COLUMN "created_at" SET DATA TYPE timestamp with time zone;--> statement-breakpoint
ALTER TABLE "t_platform" ALTER COLUMN "created_at" SET DEFAULT now();--> statement-breakpoint
ALTER TABLE "t_platform" ALTER COLUMN "created_at" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "t_platform" ALTER COLUMN "updated_at" SET DATA TYPE timestamp with time zone;--> statement-breakpoint
ALTER TABLE "t_platform" ALTER COLUMN "updated_at" SET DEFAULT now();--> statement-breakpoint
ALTER TABLE "t_platform" ALTER COLUMN "updated_at" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "t_screw" ALTER COLUMN "created_by" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "t_screw" ALTER COLUMN "updated_by" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "t_screw" ALTER COLUMN "created_at" SET DATA TYPE timestamp with time zone;--> statement-breakpoint
ALTER TABLE "t_screw" ALTER COLUMN "created_at" SET DEFAULT now();--> statement-breakpoint
ALTER TABLE "t_screw" ALTER COLUMN "created_at" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "t_screw" ALTER COLUMN "updated_at" SET DATA TYPE timestamp with time zone;--> statement-breakpoint
ALTER TABLE "t_screw" ALTER COLUMN "updated_at" SET DEFAULT now();--> statement-breakpoint
ALTER TABLE "t_screw" ALTER COLUMN "updated_at" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "t_screw_images" ALTER COLUMN "created_by" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "t_screw_images" ALTER COLUMN "updated_by" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "t_screw_images" ALTER COLUMN "created_at" SET DATA TYPE timestamp with time zone;--> statement-breakpoint
ALTER TABLE "t_screw_images" ALTER COLUMN "created_at" SET DEFAULT now();--> statement-breakpoint
ALTER TABLE "t_screw_images" ALTER COLUMN "created_at" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "t_screw_images" ALTER COLUMN "updated_at" SET DATA TYPE timestamp with time zone;--> statement-breakpoint
ALTER TABLE "t_screw_images" ALTER COLUMN "updated_at" SET DEFAULT now();--> statement-breakpoint
ALTER TABLE "t_screw_images" ALTER COLUMN "updated_at" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "t_screw_instruction" ALTER COLUMN "created_by" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "t_screw_instruction" ALTER COLUMN "updated_by" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "t_screw_instruction" ALTER COLUMN "created_at" SET DATA TYPE timestamp with time zone;--> statement-breakpoint
ALTER TABLE "t_screw_instruction" ALTER COLUMN "created_at" SET DEFAULT now();--> statement-breakpoint
ALTER TABLE "t_screw_instruction" ALTER COLUMN "created_at" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "t_screw_instruction" ALTER COLUMN "updated_at" SET DATA TYPE timestamp with time zone;--> statement-breakpoint
ALTER TABLE "t_screw_instruction" ALTER COLUMN "updated_at" SET DEFAULT now();--> statement-breakpoint
ALTER TABLE "t_screw_instruction" ALTER COLUMN "updated_at" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "t_screw_material" ALTER COLUMN "created_by" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "t_screw_material" ALTER COLUMN "updated_by" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "t_screw_material" ALTER COLUMN "created_at" SET DATA TYPE timestamp with time zone;--> statement-breakpoint
ALTER TABLE "t_screw_material" ALTER COLUMN "created_at" SET DEFAULT now();--> statement-breakpoint
ALTER TABLE "t_screw_material" ALTER COLUMN "created_at" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "t_screw_material" ALTER COLUMN "updated_at" SET DATA TYPE timestamp with time zone;--> statement-breakpoint
ALTER TABLE "t_screw_material" ALTER COLUMN "updated_at" SET DEFAULT now();--> statement-breakpoint
ALTER TABLE "t_screw_material" ALTER COLUMN "updated_at" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "t_screw_question" ALTER COLUMN "created_by" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "t_screw_question" ALTER COLUMN "updated_by" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "t_screw_question" ALTER COLUMN "created_at" SET DATA TYPE timestamp with time zone;--> statement-breakpoint
ALTER TABLE "t_screw_question" ALTER COLUMN "created_at" SET DEFAULT now();--> statement-breakpoint
ALTER TABLE "t_screw_question" ALTER COLUMN "created_at" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "t_screw_question" ALTER COLUMN "updated_at" SET DATA TYPE timestamp with time zone;--> statement-breakpoint
ALTER TABLE "t_screw_question" ALTER COLUMN "updated_at" SET DEFAULT now();--> statement-breakpoint
ALTER TABLE "t_screw_question" ALTER COLUMN "updated_at" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "t_screw_size" ALTER COLUMN "created_by" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "t_screw_size" ALTER COLUMN "updated_by" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "t_screw_size" ALTER COLUMN "created_at" SET DATA TYPE timestamp with time zone;--> statement-breakpoint
ALTER TABLE "t_screw_size" ALTER COLUMN "created_at" SET DEFAULT now();--> statement-breakpoint
ALTER TABLE "t_screw_size" ALTER COLUMN "created_at" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "t_screw_size" ALTER COLUMN "updated_at" SET DATA TYPE timestamp with time zone;--> statement-breakpoint
ALTER TABLE "t_screw_size" ALTER COLUMN "updated_at" SET DEFAULT now();--> statement-breakpoint
ALTER TABLE "t_screw_size" ALTER COLUMN "updated_at" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "t_screw_type" ALTER COLUMN "created_by" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "t_screw_type" ALTER COLUMN "updated_by" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "t_screw_type" ALTER COLUMN "created_at" SET DATA TYPE timestamp with time zone;--> statement-breakpoint
ALTER TABLE "t_screw_type" ALTER COLUMN "created_at" SET DEFAULT now();--> statement-breakpoint
ALTER TABLE "t_screw_type" ALTER COLUMN "created_at" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "t_screw_type" ALTER COLUMN "updated_at" SET DATA TYPE timestamp with time zone;--> statement-breakpoint
ALTER TABLE "t_screw_type" ALTER COLUMN "updated_at" SET DEFAULT now();--> statement-breakpoint
ALTER TABLE "t_screw_type" ALTER COLUMN "updated_at" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "t_screw_unit" ALTER COLUMN "created_by" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "t_screw_unit" ALTER COLUMN "updated_by" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "t_screw_unit" ALTER COLUMN "created_at" SET DATA TYPE timestamp with time zone;--> statement-breakpoint
ALTER TABLE "t_screw_unit" ALTER COLUMN "created_at" SET DEFAULT now();--> statement-breakpoint
ALTER TABLE "t_screw_unit" ALTER COLUMN "created_at" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "t_screw_unit" ALTER COLUMN "updated_at" SET DATA TYPE timestamp with time zone;--> statement-breakpoint
ALTER TABLE "t_screw_unit" ALTER COLUMN "updated_at" SET DEFAULT now();--> statement-breakpoint
ALTER TABLE "t_screw_unit" ALTER COLUMN "updated_at" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "t_user" ALTER COLUMN "created_by" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "t_user" ALTER COLUMN "updated_by" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "t_user" ALTER COLUMN "created_at" SET DATA TYPE timestamp with time zone;--> statement-breakpoint
ALTER TABLE "t_user" ALTER COLUMN "created_at" SET DEFAULT now();--> statement-breakpoint
ALTER TABLE "t_user" ALTER COLUMN "created_at" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "t_user" ALTER COLUMN "updated_at" SET DATA TYPE timestamp with time zone;--> statement-breakpoint
ALTER TABLE "t_user" ALTER COLUMN "updated_at" SET DEFAULT now();--> statement-breakpoint
ALTER TABLE "t_user" ALTER COLUMN "updated_at" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "t_customer" ADD COLUMN "deleted_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "t_customer" ADD COLUMN "deleted_by" text;--> statement-breakpoint
ALTER TABLE "t_customer" ADD COLUMN "version" integer DEFAULT 1 NOT NULL;--> statement-breakpoint
ALTER TABLE "t_customer_platform" ADD COLUMN "deleted_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "t_customer_platform" ADD COLUMN "deleted_by" text;--> statement-breakpoint
ALTER TABLE "t_customer_platform" ADD COLUMN "version" integer DEFAULT 1 NOT NULL;--> statement-breakpoint
ALTER TABLE "t_excel_template" ADD COLUMN "deleted_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "t_excel_template" ADD COLUMN "deleted_by" text;--> statement-breakpoint
ALTER TABLE "t_excel_template" ADD COLUMN "version" integer DEFAULT 1 NOT NULL;--> statement-breakpoint
ALTER TABLE "t_excel_template_header" ADD COLUMN "deleted_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "t_excel_template_header" ADD COLUMN "deleted_by" text;--> statement-breakpoint
ALTER TABLE "t_excel_template_header" ADD COLUMN "version" integer DEFAULT 1 NOT NULL;--> statement-breakpoint
ALTER TABLE "t_need" ADD COLUMN "deleted_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "t_need" ADD COLUMN "deleted_by" text;--> statement-breakpoint
ALTER TABLE "t_need" ADD COLUMN "version" integer DEFAULT 1 NOT NULL;--> statement-breakpoint
ALTER TABLE "t_platform" ADD COLUMN "deleted_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "t_platform" ADD COLUMN "deleted_by" text;--> statement-breakpoint
ALTER TABLE "t_platform" ADD COLUMN "version" integer DEFAULT 1 NOT NULL;--> statement-breakpoint
ALTER TABLE "t_screw" ADD COLUMN "deleted_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "t_screw" ADD COLUMN "deleted_by" text;--> statement-breakpoint
ALTER TABLE "t_screw" ADD COLUMN "version" integer DEFAULT 1 NOT NULL;--> statement-breakpoint
ALTER TABLE "t_screw_images" ADD COLUMN "deleted_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "t_screw_images" ADD COLUMN "deleted_by" text;--> statement-breakpoint
ALTER TABLE "t_screw_images" ADD COLUMN "version" integer DEFAULT 1 NOT NULL;--> statement-breakpoint
ALTER TABLE "t_screw_instruction" ADD COLUMN "deleted_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "t_screw_instruction" ADD COLUMN "deleted_by" text;--> statement-breakpoint
ALTER TABLE "t_screw_instruction" ADD COLUMN "version" integer DEFAULT 1 NOT NULL;--> statement-breakpoint
ALTER TABLE "t_screw_material" ADD COLUMN "deleted_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "t_screw_material" ADD COLUMN "deleted_by" text;--> statement-breakpoint
ALTER TABLE "t_screw_material" ADD COLUMN "version" integer DEFAULT 1 NOT NULL;--> statement-breakpoint
ALTER TABLE "t_screw_question" ADD COLUMN "deleted_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "t_screw_question" ADD COLUMN "deleted_by" text;--> statement-breakpoint
ALTER TABLE "t_screw_question" ADD COLUMN "version" integer DEFAULT 1 NOT NULL;--> statement-breakpoint
ALTER TABLE "t_screw_size" ADD COLUMN "deleted_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "t_screw_size" ADD COLUMN "deleted_by" text;--> statement-breakpoint
ALTER TABLE "t_screw_size" ADD COLUMN "version" integer DEFAULT 1 NOT NULL;--> statement-breakpoint
ALTER TABLE "t_screw_type" ADD COLUMN "deleted_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "t_screw_type" ADD COLUMN "deleted_by" text;--> statement-breakpoint
ALTER TABLE "t_screw_type" ADD COLUMN "version" integer DEFAULT 1 NOT NULL;--> statement-breakpoint
ALTER TABLE "t_screw_unit" ADD COLUMN "deleted_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "t_screw_unit" ADD COLUMN "deleted_by" text;--> statement-breakpoint
ALTER TABLE "t_screw_unit" ADD COLUMN "version" integer DEFAULT 1 NOT NULL;--> statement-breakpoint
ALTER TABLE "t_user" ADD COLUMN "deleted_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "t_user" ADD COLUMN "deleted_by" text;--> statement-breakpoint
ALTER TABLE "t_user" ADD COLUMN "version" integer DEFAULT 1 NOT NULL;--> statement-breakpoint
CREATE INDEX "idx_deleted_at_t_customer" ON "t_customer" USING btree ("deleted_at");--> statement-breakpoint
CREATE INDEX "idx_created_at_t_customer" ON "t_customer" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "idx_created_by_at_t_customer" ON "t_customer" USING btree ("created_by","created_at");--> statement-breakpoint
CREATE INDEX "idx_deleted_at_t_customer_platform" ON "t_customer_platform" USING btree ("deleted_at");--> statement-breakpoint
CREATE INDEX "idx_created_at_t_customer_platform" ON "t_customer_platform" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "idx_created_by_at_t_customer_platform" ON "t_customer_platform" USING btree ("created_by","created_at");--> statement-breakpoint
CREATE INDEX "idx_deleted_at_t_excel_template" ON "t_excel_template" USING btree ("deleted_at");--> statement-breakpoint
CREATE INDEX "idx_created_at_t_excel_template" ON "t_excel_template" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "idx_created_by_at_t_excel_template" ON "t_excel_template" USING btree ("created_by","created_at");--> statement-breakpoint
CREATE INDEX "idx_deleted_at_t_excel_template_header" ON "t_excel_template_header" USING btree ("deleted_at");--> statement-breakpoint
CREATE INDEX "idx_created_at_t_excel_template_header" ON "t_excel_template_header" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "idx_created_by_at_t_excel_template_header" ON "t_excel_template_header" USING btree ("created_by","created_at");--> statement-breakpoint
CREATE INDEX "idx_deleted_at_t_need" ON "t_need" USING btree ("deleted_at");--> statement-breakpoint
CREATE INDEX "idx_created_at_t_need" ON "t_need" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "idx_created_by_at_t_need" ON "t_need" USING btree ("created_by","created_at");--> statement-breakpoint
CREATE INDEX "idx_deleted_at_t_platform" ON "t_platform" USING btree ("deleted_at");--> statement-breakpoint
CREATE INDEX "idx_created_at_t_platform" ON "t_platform" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "idx_created_by_at_t_platform" ON "t_platform" USING btree ("created_by","created_at");--> statement-breakpoint
CREATE INDEX "idx_deleted_at_t_screw" ON "t_screw" USING btree ("deleted_at");--> statement-breakpoint
CREATE INDEX "idx_created_at_t_screw" ON "t_screw" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "idx_created_by_at_t_screw" ON "t_screw" USING btree ("created_by","created_at");--> statement-breakpoint
CREATE INDEX "idx_deleted_at_t_screw_images" ON "t_screw_images" USING btree ("deleted_at");--> statement-breakpoint
CREATE INDEX "idx_created_at_t_screw_images" ON "t_screw_images" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "idx_created_by_at_t_screw_images" ON "t_screw_images" USING btree ("created_by","created_at");--> statement-breakpoint
CREATE INDEX "idx_deleted_at_t_screw_instruction" ON "t_screw_instruction" USING btree ("deleted_at");--> statement-breakpoint
CREATE INDEX "idx_created_at_t_screw_instruction" ON "t_screw_instruction" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "idx_created_by_at_t_screw_instruction" ON "t_screw_instruction" USING btree ("created_by","created_at");--> statement-breakpoint
CREATE INDEX "idx_deleted_at_t_screw_material" ON "t_screw_material" USING btree ("deleted_at");--> statement-breakpoint
CREATE INDEX "idx_created_at_t_screw_material" ON "t_screw_material" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "idx_created_by_at_t_screw_material" ON "t_screw_material" USING btree ("created_by","created_at");--> statement-breakpoint
CREATE INDEX "idx_deleted_at_t_screw_question" ON "t_screw_question" USING btree ("deleted_at");--> statement-breakpoint
CREATE INDEX "idx_created_at_t_screw_question" ON "t_screw_question" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "idx_created_by_at_t_screw_question" ON "t_screw_question" USING btree ("created_by","created_at");--> statement-breakpoint
CREATE INDEX "idx_deleted_at_t_screw_size" ON "t_screw_size" USING btree ("deleted_at");--> statement-breakpoint
CREATE INDEX "idx_created_at_t_screw_size" ON "t_screw_size" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "idx_created_by_at_t_screw_size" ON "t_screw_size" USING btree ("created_by","created_at");--> statement-breakpoint
CREATE INDEX "idx_deleted_at_t_screw_type" ON "t_screw_type" USING btree ("deleted_at");--> statement-breakpoint
CREATE INDEX "idx_created_at_t_screw_type" ON "t_screw_type" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "idx_created_by_at_t_screw_type" ON "t_screw_type" USING btree ("created_by","created_at");--> statement-breakpoint
CREATE INDEX "idx_deleted_at_t_screw_unit" ON "t_screw_unit" USING btree ("deleted_at");--> statement-breakpoint
CREATE INDEX "idx_created_at_t_screw_unit" ON "t_screw_unit" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "idx_created_by_at_t_screw_unit" ON "t_screw_unit" USING btree ("created_by","created_at");--> statement-breakpoint
CREATE INDEX "idx_deleted_at_t_user" ON "t_user" USING btree ("deleted_at");--> statement-breakpoint
CREATE INDEX "idx_created_at_t_user" ON "t_user" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "idx_created_by_at_t_user" ON "t_user" USING btree ("created_by","created_at");--> statement-breakpoint
ALTER TABLE "t_customer" DROP COLUMN "is_deleted";--> statement-breakpoint
ALTER TABLE "t_customer_platform" DROP COLUMN "is_deleted";--> statement-breakpoint
ALTER TABLE "t_excel_template" DROP COLUMN "is_deleted";--> statement-breakpoint
ALTER TABLE "t_excel_template_header" DROP COLUMN "is_deleted";--> statement-breakpoint
ALTER TABLE "t_need" DROP COLUMN "is_deleted";--> statement-breakpoint
ALTER TABLE "t_platform" DROP COLUMN "is_deleted";--> statement-breakpoint
ALTER TABLE "t_screw" DROP COLUMN "is_deleted";--> statement-breakpoint
ALTER TABLE "t_screw_images" DROP COLUMN "is_deleted";--> statement-breakpoint
ALTER TABLE "t_screw_instruction" DROP COLUMN "is_deleted";--> statement-breakpoint
ALTER TABLE "t_screw_material" DROP COLUMN "is_deleted";--> statement-breakpoint
ALTER TABLE "t_screw_question" DROP COLUMN "is_deleted";--> statement-breakpoint
ALTER TABLE "t_screw_size" DROP COLUMN "is_deleted";--> statement-breakpoint
ALTER TABLE "t_screw_type" DROP COLUMN "is_deleted";--> statement-breakpoint
ALTER TABLE "t_screw_unit" DROP COLUMN "is_deleted";--> statement-breakpoint
ALTER TABLE "t_user" DROP COLUMN "is_deleted";