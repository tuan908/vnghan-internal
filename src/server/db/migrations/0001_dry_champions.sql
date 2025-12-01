CREATE TABLE "t_excel_template" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"is_active" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	"is_deleted" boolean DEFAULT false
);
--> statement-breakpoint
CREATE TABLE "t_excel_template_header" (
	"id" serial PRIMARY KEY NOT NULL,
	"template_id" integer NOT NULL,
	"label" text NOT NULL,
	"key" text NOT NULL,
	"order" integer NOT NULL,
	"example_value" text,
	"required" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	"is_deleted" boolean DEFAULT false
);
--> statement-breakpoint
ALTER TABLE "t_excel_template_header" ADD CONSTRAINT "t_excel_template_header_template_id_t_excel_template_id_fk" FOREIGN KEY ("template_id") REFERENCES "public"."t_excel_template"("id") ON DELETE cascade ON UPDATE no action;