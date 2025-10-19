import {
  pgTable,
  serial,
  varchar,
  text,
  timestamp,
  integer,
  index,
} from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  clerkUserId: varchar("clerk_user_id", { length: 191 }).notNull().unique(),
  name: varchar("name", { length: 255 }).notNull(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  image: text("image"),
  role: varchar("role", { length: 12 }).notNull().default("customer"),
  updatedAt: timestamp("updated_at").default(sql`CURRENT_TIMESTAMP`),
  createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`),
});

export const posts = pgTable("posts", {
  id: serial("id").primaryKey(),
  userId: integer("user_id")
    .notNull()
    .references(() => users.id, {
      onDelete: "cascade",
    })
    .notNull(),
  description: text("description"),
  Image: text("image"),
  updatedAt: timestamp("updated_at").default(sql`CURRENT_TIMESTAMP`),
  createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`),
});

// Likes table
export const likes = pgTable("likes", {
  id: serial("id").primaryKey(),
  userId: integer("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  postId: integer("post_id")
    .notNull()
    .references(() => posts.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at")
    .notNull()
    .default(sql`CURRENT_TIMESTAMP`),
});

// Comments table
export const comments = pgTable("comments", {
  id: serial("id").primaryKey(),
  userId: integer("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  postId: integer("post_id")
    .notNull()
    .references(() => posts.id, { onDelete: "cascade" }),
  content: text("content").notNull(),
  parentCommentId: integer("parent_comment_id"), // For nested replies
  likesCount: integer("likes_count").notNull().default(0),
  createdAt: timestamp("created_at")
    .notNull()
    .default(sql`CURRENT_TIMESTAMP`),
  updatedAt: timestamp("updated_at")
    .notNull()
    .default(sql`CURRENT_TIMESTAMP`),
});

// Comment likes table
export const commentLikes = pgTable("comment_likes", {
  id: serial("id").primaryKey(),
  userId: integer("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  commentId: integer("comment_id")
    .notNull()
    .references(() => comments.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at")
    .notNull()
    .default(sql`CURRENT_TIMESTAMP`),
});

// Shares/Reposts table
export const shares = pgTable("shares", {
  id: serial("id").primaryKey(),
  userId: integer("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  postId: integer("post_id")
    .notNull()
    .references(() => posts.id, { onDelete: "cascade" }),
  caption: text("caption"), // Optional caption when sharing
  createdAt: timestamp("created_at")
    .notNull()
    .default(sql`CURRENT_TIMESTAMP`),
});

export const followers = pgTable(
  "followers",
  {
    id: serial("id").primaryKey(),

    // The user who is following someone
    followerId: integer("follower_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),

    // The user being followed
    followingId: integer("following_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),

    createdAt: timestamp("created_at")
      .notNull()
      .default(sql`CURRENT_TIMESTAMP`),
  },
  (table) => ({
    // Composite index for faster queries
    followerFollowingIdx: index("follower_following_idx").on(
      table.followerId,
      table.followingId
    ),
    // Index for getting followers of a user
    followingIdIdx: index("following_id_idx").on(table.followingId),
    // Index for getting who a user is following
    followerIdIdx: index("follower_id_idx").on(table.followerId),
  })
);
