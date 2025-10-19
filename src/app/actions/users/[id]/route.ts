import { NextResponse } from "next/server";
import { db } from "@/lib/db/db";
import { users, posts, followers } from "@/lib/schema";
import { eq, and } from "drizzle-orm";
import { checkUser } from "@/lib/db/checkInUser";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id?: string }> }
) {
  try {
    const { id } = await params;
    if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

    // Accept either numeric local user id or clerkUserId string
    const numericId = Number(id);

    let userRows;
    if (!Number.isNaN(numericId)) {
      // numeric local id
      userRows = await db
        .select()
        .from(users)
        .where(eq(users.id, numericId))
        .limit(1);
    } else {
      // treat as clerkUserId string
      userRows = await db
        .select()
        .from(users)
        .where(eq(users.clerkUserId, id))
        .limit(1);
    }
    if (!userRows.length)
      return NextResponse.json({ error: "User not found" }, { status: 404 });

    const user = userRows[0];
    const userId = user.id;

    // fetch posts by user
    const userPosts = await db
      .select({
        id: posts.id,
        description: posts.description,
        Image: posts.Image,
        createdAt: posts.createdAt,
      })
      .from(posts)
      .where(eq(posts.userId, userId))
      .limit(50);

    // follower/following counts
    const followerCountRows = await db
      .select()
      .from(followers)
      .where(eq(followers.followingId, userId));
    const followingCountRows = await db
      .select()
      .from(followers)
      .where(eq(followers.followerId, userId));

    // is current user following this profile?
    const me = await checkUser();
    let isFollowing = false;
    if (me) {
      const isF = await db
        .select()
        .from(followers)
        .where(
          and(
            eq(followers.followingId, userId),
            eq(followers.followerId, me.id)
          )
        )
        .limit(1);
      isFollowing = isF.length > 0;
    }

    return NextResponse.json({
      success: true,
      data: {
        user: {
          id: user.id,
          name: user.name,
          image: user.image,
          email: user.email,
        },
        posts: userPosts,
        followerCount: followerCountRows.length,
        followingCount: followingCountRows.length,
        isFollowing,
      },
    });
  } catch (err: unknown) {
    console.error("Failed to fetch user profile", err);
    return NextResponse.json(
      { error: "Failed to fetch user profile" },
      { status: 500 }
    );
  }
}
