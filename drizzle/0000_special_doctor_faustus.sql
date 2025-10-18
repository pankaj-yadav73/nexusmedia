CREATE TABLE "users" (
	"id" serial PRIMARY KEY NOT NULL,
	"clerk_user_id" varchar(191) NOT NULL,
	"name" varchar(255) NOT NULL,
	"email" varchar(255) NOT NULL,
	"image" text,
	"role" varchar(12) DEFAULT 'customer' NOT NULL,
	"updated_at" timestamp DEFAULT CURRENT_TIMESTAMP,
	"created_at" timestamp DEFAULT CURRENT_TIMESTAMP,
	CONSTRAINT "users_clerk_user_id_unique" UNIQUE("clerk_user_id"),
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
