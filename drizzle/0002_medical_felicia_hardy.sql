ALTER TABLE "posts" ALTER COLUMN "description" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "posts" ALTER COLUMN "description" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "posts" ADD COLUMN "text" text;