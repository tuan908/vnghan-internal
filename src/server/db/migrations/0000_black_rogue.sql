CREATE TABLE "t_customer" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text,
	"phone" text,
	"address" text,
	"next_message_time" text,
	"note" text,
	"money" text,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	"is_deleted" boolean DEFAULT false,
	"need" text DEFAULT '',
	"created_by" integer,
	"updated_by" integer,
	"assigned_to" integer
);
--> statement-breakpoint
CREATE TABLE "t_customer_platform" (
	"id" serial PRIMARY KEY NOT NULL,
	"customer_id" integer NOT NULL,
	"platform_id" integer NOT NULL,
	"user_id" integer NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	"is_deleted" boolean DEFAULT false
);
--> statement-breakpoint
CREATE TABLE "t_need" (
	"id" serial PRIMARY KEY NOT NULL,
	"description" text,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	"is_deleted" boolean DEFAULT false
);
--> statement-breakpoint
CREATE TABLE "t_platform" (
	"id" serial PRIMARY KEY NOT NULL,
	"description" text,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	"is_deleted" boolean DEFAULT false
);
--> statement-breakpoint
CREATE TABLE "t_screw" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text,
	"description" text,
	"type_id" integer NOT NULL,
	"size_id" integer NOT NULL,
	"material_id" integer NOT NULL,
	"note" text,
	"price" text,
	"quantity" text,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	"is_deleted" boolean DEFAULT false
);
--> statement-breakpoint
CREATE TABLE "t_screw_images" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text,
	"note" text,
	"screw_id" integer,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	"is_deleted" boolean DEFAULT false
);
--> statement-breakpoint
CREATE TABLE "t_screw_instruction" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text,
	"data" jsonb,
	"note" text,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	"is_deleted" boolean DEFAULT false
);
--> statement-breakpoint
CREATE TABLE "t_screw_material" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text,
	"note" text,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	"is_deleted" boolean DEFAULT false
);
--> statement-breakpoint
CREATE TABLE "t_screw_question" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text,
	"data" jsonb,
	"note" text,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	"is_deleted" boolean DEFAULT false
);
--> statement-breakpoint
CREATE TABLE "t_screw_size" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text,
	"note" text,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	"is_deleted" boolean DEFAULT false
);
--> statement-breakpoint
CREATE TABLE "t_screw_type" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text,
	"note" text,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	"is_deleted" boolean DEFAULT false
);
--> statement-breakpoint
CREATE TABLE "t_screw_unit" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text,
	"detail" text,
	"note" text,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	"is_deleted" boolean DEFAULT false
);
--> statement-breakpoint
CREATE TABLE "t_user" (
	"id" serial PRIMARY KEY NOT NULL,
	"username" text,
	"password_hash" text,
	"role" text DEFAULT '001',
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	"is_deleted" boolean DEFAULT false
);
--> statement-breakpoint
ALTER TABLE "t_customer" ADD CONSTRAINT "t_customer_created_by_t_user_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."t_user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "t_customer" ADD CONSTRAINT "t_customer_updated_by_t_user_id_fk" FOREIGN KEY ("updated_by") REFERENCES "public"."t_user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "t_customer" ADD CONSTRAINT "t_customer_assigned_to_t_user_id_fk" FOREIGN KEY ("assigned_to") REFERENCES "public"."t_user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "t_customer_platform" ADD CONSTRAINT "t_customer_platform_customer_id_t_customer_id_fk" FOREIGN KEY ("customer_id") REFERENCES "public"."t_customer"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "t_customer_platform" ADD CONSTRAINT "t_customer_platform_platform_id_t_platform_id_fk" FOREIGN KEY ("platform_id") REFERENCES "public"."t_platform"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "t_customer_platform" ADD CONSTRAINT "t_customer_platform_user_id_t_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."t_user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "t_screw" ADD CONSTRAINT "t_screw_type_id_t_screw_type_id_fk" FOREIGN KEY ("type_id") REFERENCES "public"."t_screw_type"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "t_screw" ADD CONSTRAINT "t_screw_size_id_t_screw_size_id_fk" FOREIGN KEY ("size_id") REFERENCES "public"."t_screw_size"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "t_screw" ADD CONSTRAINT "t_screw_material_id_t_screw_material_id_fk" FOREIGN KEY ("material_id") REFERENCES "public"."t_screw_material"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "t_screw_images" ADD CONSTRAINT "t_screw_images_screw_id_t_screw_id_fk" FOREIGN KEY ("screw_id") REFERENCES "public"."t_screw"("id") ON DELETE no action ON UPDATE no action;