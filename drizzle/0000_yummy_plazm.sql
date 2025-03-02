CREATE TYPE "public"."file_types" AS ENUM('logo', 'cover', 'presentation', 'handout', 'research');--> statement-breakpoint
CREATE TYPE "public"."visibility_types" AS ENUM('public', 'private');--> statement-breakpoint
CREATE TABLE "presentation-foundation_files" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"file_types" "file_types" NOT NULL,
	"type" text NOT NULL,
	"size" integer NOT NULL,
	"key" varchar(48) NOT NULL,
	"ufs_url" text NOT NULL,
	"is_locked" boolean DEFAULT false,
	"password" text,
	"presentation_id" serial NOT NULL,
	"owner" varchar(32) NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "presentation-foundation_presentations" (
	"id" serial PRIMARY KEY NOT NULL,
	"shortname" varchar(25) NOT NULL,
	"title" text NOT NULL,
	"description" text,
	"logo" serial NOT NULL,
	"cover" serial NOT NULL,
	"presentation" serial NOT NULL,
	"handout" serial NOT NULL,
	"research" serial NOT NULL,
	"kahoot_pin" text,
	"kahoot_self_host_url" text,
	"credits" text,
	"visibility_types" "visibility_types" DEFAULT 'private' NOT NULL,
	"owner" varchar(32) NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "presentation-foundation_presentations_shortname_unique" UNIQUE("shortname")
);
--> statement-breakpoint
ALTER TABLE "presentation-foundation_presentations" ADD CONSTRAINT "presentation-foundation_presentations_logo_presentation-foundation_files_id_fk" FOREIGN KEY ("logo") REFERENCES "public"."presentation-foundation_files"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "presentation-foundation_presentations" ADD CONSTRAINT "presentation-foundation_presentations_cover_presentation-foundation_files_id_fk" FOREIGN KEY ("cover") REFERENCES "public"."presentation-foundation_files"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "presentation-foundation_presentations" ADD CONSTRAINT "presentation-foundation_presentations_presentation_presentation-foundation_files_id_fk" FOREIGN KEY ("presentation") REFERENCES "public"."presentation-foundation_files"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "presentation-foundation_presentations" ADD CONSTRAINT "presentation-foundation_presentations_handout_presentation-foundation_files_id_fk" FOREIGN KEY ("handout") REFERENCES "public"."presentation-foundation_files"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "presentation-foundation_presentations" ADD CONSTRAINT "presentation-foundation_presentations_research_presentation-foundation_files_id_fk" FOREIGN KEY ("research") REFERENCES "public"."presentation-foundation_files"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "file_id_idx" ON "presentation-foundation_files" USING btree ("id");--> statement-breakpoint
CREATE INDEX "file_presentation_id_idx" ON "presentation-foundation_files" USING btree ("presentation_id");--> statement-breakpoint
CREATE INDEX "file_owner_idx" ON "presentation-foundation_files" USING btree ("owner");--> statement-breakpoint
CREATE INDEX "file_type_presentation_id_idx" ON "presentation-foundation_files" USING btree ("file_types","presentation_id");--> statement-breakpoint
CREATE INDEX "pr_id_idx" ON "presentation-foundation_presentations" USING btree ("id");--> statement-breakpoint
CREATE INDEX "pr_shortname_idx" ON "presentation-foundation_presentations" USING btree ("shortname");--> statement-breakpoint
CREATE INDEX "pr_owner_idx" ON "presentation-foundation_presentations" USING btree ("owner");--> statement-breakpoint
CREATE INDEX "pr_owner_visibility_idx" ON "presentation-foundation_presentations" USING btree ("owner","visibility_types");--> statement-breakpoint
CREATE INDEX "pr_visibility_idx" ON "presentation-foundation_presentations" USING btree ("visibility_types");