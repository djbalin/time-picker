ALTER TABLE "polls" ADD COLUMN "creatorEmail" text;--> statement-breakpoint
UPDATE "polls" SET "creatorEmail" = 'unknown@example.com' WHERE "creatorEmail" IS NULL;--> statement-breakpoint
ALTER TABLE "polls" ALTER COLUMN "creatorEmail" SET NOT NULL;
