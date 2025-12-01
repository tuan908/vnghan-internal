ALTER TABLE "t_customer_platform" DROP CONSTRAINT "t_customer_platform_customer_id_t_customer_id_fk";
--> statement-breakpoint
ALTER TABLE "t_customer_platform" DROP CONSTRAINT "t_customer_platform_platform_id_t_platform_id_fk";
--> statement-breakpoint
ALTER TABLE "t_customer_platform" ADD CONSTRAINT "t_customer_platform_customer_id_t_customer_id_fk" FOREIGN KEY ("customer_id") REFERENCES "public"."t_customer"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "t_customer_platform" ADD CONSTRAINT "t_customer_platform_platform_id_t_platform_id_fk" FOREIGN KEY ("platform_id") REFERENCES "public"."t_platform"("id") ON DELETE cascade ON UPDATE cascade;