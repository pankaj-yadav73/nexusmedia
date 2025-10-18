import { db } from "@/lib/db/db";
import { posts, users } from "@/lib/schema";
import { currentUser } from "@clerk/nextjs/server";
import { NextResponse, NextRequest } from "next/server";
import { eq } from "drizzle-orm";

import { userPostSchema, isServer } from "@/lib/validators/userPostSchema";

export async function POST(req: NextRequest) {
  try {
    const user = await currentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const dbUser = await db
      .select()
      .from(users)
      .where(eq(users.clerkUserId, user.id))
      .limit(1);

    if (!dbUser.length) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const body = await req.json();
    const { content, imageUrl, videoUrl, isPublic } = body;

    if (!content || content.trim() === "") {
      return NextResponse.json(
        { error: "Content is required" },
        { status: 400 }
      );
    }

    const newPost = await db
      .insert(posts)
      .values({
        userId: dbUser[0].id,
        content,
        imageUrl: imageUrl || null,
        videoUrl: videoUrl || null,
        isPublic: isPublic ?? true,
      })
      .returning();

    return NextResponse.json(
      {
        success: true,
        data: newPost[0],
      },
      { status: 201 }
    );
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to create post" },
      { status: 500 }
    );
  }
}
