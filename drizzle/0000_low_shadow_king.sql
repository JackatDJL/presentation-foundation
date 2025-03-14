CREATE TYPE "public"."file_types" AS ENUM('logo', 'cover', 'presentation', 'handout', 'research');--> statement-breakpoint
CREATE TYPE "public"."visibility_types" AS ENUM('public', 'private');--> statement-breakpoint
CREATE TABLE "pr.f-files" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"fileType" "file_types" NOT NULL,
	"dataType" text NOT NULL,
	"size" integer NOT NULL,
	"key" varchar(48) NOT NULL,
	"ufs_url" text NOT NULL,
	"is_locked" boolean DEFAULT false,
	"password" text,
	"presentation_id" uuid NOT NULL,
	"owner" varchar(32) NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "pr.f-files_id_unique" UNIQUE("id")
);
--> statement-breakpoint
CREATE TABLE "pr.f-presentations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"shortname" varchar(25) NOT NULL,
	"title" text NOT NULL,
	"description" text,
	"logo" uuid,
	"cover" uuid,
	"presentation" uuid,
	"handout" uuid,
	"research" uuid,
	"kahoot_pin" text,
	"kahoot_id" text,
	"credits" text,
	"visibility" "visibility_types" DEFAULT 'private' NOT NULL,
	"owner" varchar(32) NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "pr.f-presentations_id_unique" UNIQUE("id"),
	CONSTRAINT "pr.f-presentations_shortname_unique" UNIQUE("shortname")
);
--> statement-breakpoint
ALTER TABLE "pr.f-presentations" ADD CONSTRAINT "pr.f-presentations_logo_pr.f-files_id_fk" FOREIGN KEY ("logo") REFERENCES "public"."pr.f-files"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pr.f-presentations" ADD CONSTRAINT "pr.f-presentations_cover_pr.f-files_id_fk" FOREIGN KEY ("cover") REFERENCES "public"."pr.f-files"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pr.f-presentations" ADD CONSTRAINT "pr.f-presentations_presentation_pr.f-files_id_fk" FOREIGN KEY ("presentation") REFERENCES "public"."pr.f-files"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pr.f-presentations" ADD CONSTRAINT "pr.f-presentations_handout_pr.f-files_id_fk" FOREIGN KEY ("handout") REFERENCES "public"."pr.f-files"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pr.f-presentations" ADD CONSTRAINT "pr.f-presentations_research_pr.f-files_id_fk" FOREIGN KEY ("research") REFERENCES "public"."pr.f-files"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "file_id_idx" ON "pr.f-files" USING btree ("id");--> statement-breakpoint
CREATE INDEX "file_presentation_id_idx" ON "pr.f-files" USING btree ("presentation_id");--> statement-breakpoint
CREATE INDEX "file_owner_idx" ON "pr.f-files" USING btree ("owner");--> statement-breakpoint
CREATE INDEX "fileType_presentation_id_idx" ON "pr.f-files" USING btree ("fileType","presentation_id");--> statement-breakpoint
CREATE INDEX "pr_id_idx" ON "pr.f-presentations" USING btree ("id");--> statement-breakpoint
CREATE INDEX "pr_shortname_idx" ON "pr.f-presentations" USING btree ("shortname");--> statement-breakpoint
CREATE INDEX "pr_owner_idx" ON "pr.f-presentations" USING btree ("owner");--> statement-breakpoint
CREATE INDEX "pr_owner_visibility_idx" ON "pr.f-presentations" USING btree ("owner","visibility");--> statement-breakpoint
CREATE INDEX "pr_visibility_idx" ON "pr.f-presentations" USING btree ("visibility");--> statement-breakpoint
CREATE INDEX "pr_kahoot_pin_idx" ON "pr.f-presentations" USING btree ("kahoot_pin");--> statement-breakpoint
CREATE INDEX "pr_kahoot_id_idx" ON "pr.f-presentations" USING btree ("kahoot_id");