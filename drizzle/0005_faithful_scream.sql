CREATE INDEX "follower_following_idx" ON "followers" USING btree ("follower_id","following_id");--> statement-breakpoint
CREATE INDEX "following_id_idx" ON "followers" USING btree ("following_id");--> statement-breakpoint
CREATE INDEX "follower_id_idx" ON "followers" USING btree ("follower_id");