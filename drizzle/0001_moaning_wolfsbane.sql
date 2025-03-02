ALTER TABLE "presentation-foundation_presentations" RENAME COLUMN "visibility_types" TO "visibility";--> statement-breakpoint
DROP INDEX "file_type_presentation_id_idx";--> statement-breakpoint
DROP INDEX "pr_owner_visibility_idx";--> statement-breakpoint
DROP INDEX "pr_visibility_idx";--> statement-breakpoint
ALTER TABLE "presentation-foundation_files" ALTER COLUMN "id" SET DATA TYPE integer;--> statement-breakpoint
ALTER TABLE "presentation-foundation_files" ALTER COLUMN "presentation_id" SET DATA TYPE integer;--> statement-breakpoint
ALTER TABLE "presentation-foundation_presentations" ALTER COLUMN "id" SET DATA TYPE integer;--> statement-breakpoint
ALTER TABLE "presentation-foundation_presentations" ALTER COLUMN "logo" SET DATA TYPE integer;--> statement-breakpoint
ALTER TABLE "presentation-foundation_presentations" ALTER COLUMN "logo" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "presentation-foundation_presentations" ALTER COLUMN "cover" SET DATA TYPE integer;--> statement-breakpoint
ALTER TABLE "presentation-foundation_presentations" ALTER COLUMN "cover" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "presentation-foundation_presentations" ALTER COLUMN "presentation" SET DATA TYPE integer;--> statement-breakpoint
ALTER TABLE "presentation-foundation_presentations" ALTER COLUMN "presentation" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "presentation-foundation_presentations" ALTER COLUMN "handout" SET DATA TYPE integer;--> statement-breakpoint
ALTER TABLE "presentation-foundation_presentations" ALTER COLUMN "handout" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "presentation-foundation_presentations" ALTER COLUMN "research" SET DATA TYPE integer;--> statement-breakpoint
ALTER TABLE "presentation-foundation_presentations" ALTER COLUMN "research" DROP NOT NULL;--> statement-breakpoint
CREATE INDEX "file_type_presentation_id_idx" ON "presentation-foundation_files" USING btree ("type","presentation_id");--> statement-breakpoint
CREATE INDEX "pr_owner_visibility_idx" ON "presentation-foundation_presentations" USING btree ("owner","visibility");--> statement-breakpoint
CREATE INDEX "pr_visibility_idx" ON "presentation-foundation_presentations" USING btree ("visibility");--> statement-breakpoint
ALTER TABLE "presentation-foundation_files" DROP COLUMN "file_types";--> statement-breakpoint
ALTER TABLE "presentation-foundation_files" ADD CONSTRAINT "presentation-foundation_files_id_unique" UNIQUE("id");--> statement-breakpoint
ALTER TABLE "presentation-foundation_presentations" ADD CONSTRAINT "presentation-foundation_presentations_id_unique" UNIQUE("id");