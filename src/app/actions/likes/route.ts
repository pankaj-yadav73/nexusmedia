import { NextResponse, NextRequest } from "next/server";
import { db } from "@/lib/db/db";
import { likes } from "@/lib/schema";
import { checkUser } from "@/lib/db/checkInUser";
import { eq, and } from "drizzle-orm";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { postId } = body as { postId?: number };
    if (!postId)
      return NextResponse.json({ error: "Missing postId" }, { status: 400 });

    const me = await checkUser();
    if (!me)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const existing = await db
      .select()
      .from(likes)
      .where(and(eq(likes.userId, me.id), eq(likes.postId, postId)))
      .limit(1);
    if (existing.length) {
      await db.delete(likes).where(eq(likes.id, existing[0].id));
      const rows = await db
        .select()
        .from(likes)
        .where(eq(likes.postId, postId));
      return NextResponse.json(
        { success: true, action: "unliked", count: rows.length },
        { status: 200 }
      );
    }

    await db.insert(likes).values({ userId: me.id, postId });
    const rows = await db.select().from(likes).where(eq(likes.postId, postId));
    return NextResponse.json(
      { success: true, action: "liked", count: rows.length },
      { status: 201 }
    );
  } catch (err: unknown) {
    return NextResponse.json(
      { error: (err as Error).message ?? String(err) },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    const postIdStr = req.nextUrl.searchParams.get("postId");
    if (!postIdStr)
      return NextResponse.json({ error: "Missing postId" }, { status: 400 });
    const postId = Number(postIdStr);
    if (Number.isNaN(postId))
      return NextResponse.json({ error: "Invalid postId" }, { status: 400 });

    const rows = await db.select().from(likes).where(eq(likes.postId, postId));
    const count = rows.length;

    const me = await checkUser();
    let isLiked = false;
    if (me) {
      const exists = await db
        .select()
        .from(likes)
        .where(and(eq(likes.postId, postId), eq(likes.userId, me.id)))
        .limit(1);
      isLiked = exists.length > 0;
    }

    return NextResponse.json(
      { success: true, data: { count, isLiked } },
      { status: 200 }
    );
  } catch (err: unknown) {
    return NextResponse.json(
      { error: (err as Error).message ?? String(err) },
      { status: 500 }
    );
  }
}
