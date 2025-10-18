CREATE TABLE "posts" (
	"id" serial NOT NULL,
	"user_id" integer NOT NULL,
	"image" text,
	"title" varchar(191) NOT NULL,
	"description" varchar(500) NOT NULL,
	"updated_at" timestamp DEFAULT CURRENT_TIMESTAMP,
	"created_at" timestamp DEFAULT CURRENT_TIMESTAMP,
	CONSTRAINT "posts_id_unique" UNIQUE("id")
);
--> statement-breakpoint
ALTER TABLE "posts" ADD CONSTRAINT "posts_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;