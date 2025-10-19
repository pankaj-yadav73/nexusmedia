import { NextResponse } from "next/server";
import { db } from "@/lib/db/db";
import { followers, users } from "@/lib/schema";
import { eq, and, not } from "drizzle-orm";
import { checkUser } from "@/lib/db/checkInUser";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { targetUserId, action } = body as {
      targetUserId?: number | string;
      action?: string;
    };

    if (!targetUserId || !action) {
      return NextResponse.json(
        { error: "Missing parameters" },
        { status: 400 }
      );
    }

    // Map the authenticated Clerk user to our local users table (create if missing)
    const me = await checkUser();
    if (!me) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const targetId = Number(targetUserId);
    if (Number.isNaN(targetId)) {
      return NextResponse.json(
        { error: "Invalid targetUserId" },
        { status: 400 }
      );
    }

    // Ensure target user exists
    const targetRows = await db
      .select()
      .from(users)
      .where(eq(users.id, targetId))
      .limit(1);
    if (!targetRows.length) {
      return NextResponse.json(
        { error: "Target user not found" },
        { status: 404 }
      );
    }

    if (targetId === me.id) {
      return NextResponse.json(
        { error: "Cannot follow yourself" },
        { status: 400 }
      );
    }

    if (action === "follow") {
      // avoid duplicates
      const existing = await db
        .select()
        .from(followers)
        .where(
          and(
            eq(followers.followerId, me.id),
            eq(followers.followingId, targetId)
          )
        )
        .limit(1);

      if (!existing.length) {
        const inserted = await db
          .insert(followers)
          .values({ followerId: me.id, followingId: targetId })
          .returning();
        return NextResponse.json(
          { success: true, data: inserted[0] },
          { status: 201 }
        );
      }

      return NextResponse.json(
        { success: true, message: "Already following" },
        { status: 200 }
      );
    }

    if (action === "unfollow") {
      const deleted = await db
        .delete(followers)
        .where(
          and(
            eq(followers.followerId, me.id),
            eq(followers.followingId, targetId)
          )
        );

      return NextResponse.json(
        { success: true, data: { deleted } },
        { status: 200 }
      );
    }

    return NextResponse.json({ error: "Unknown action" }, { status: 400 });
  } catch (err: unknown) {
    return NextResponse.json(
      { error: (err as Error).message ?? String(err) },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const me = await checkUser();
    if (!me)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    // Fetch candidate users (exclude current user) with follower counts
    // We'll fetch up to 10 suggestions ordered by follower count desc
    const rows = await db
      .select({
        id: users.id,
        name: users.name,
        image: users.image,
      })
      .from(users)
      .where(not(eq(users.id, me.id)))
      .limit(10);

    // For each candidate compute followerCount and whether current user follows them
    const suggestions = await Promise.all(
      rows.map(async (r) => {
        const followerCountRows = await db
          .select()
          .from(followers)
          .where(eq(followers.followingId, r.id));

        const isFollowingRows = await db
          .select()
          .from(followers)
          .where(
            and(
              eq(followers.followingId, r.id),
              eq(followers.followerId, me.id)
            )
          )
          .limit(1);

        return {
          id: r.id,
          name: r.name,
          image: r.image,
          followerCount: followerCountRows.length,
          isFollowing: isFollowingRows.length > 0,
        };
      })
    );

    return NextResponse.json(
      { success: true, data: suggestions },
      { status: 200 }
    );
  } catch (err: unknown) {
    console.error("Failed to fetch follow suggestions", err);
    return NextResponse.json(
      { error: "Failed to fetch suggestions" },
      { status: 500 }
    );
  }
}
