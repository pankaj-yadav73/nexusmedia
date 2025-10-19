import { NextResponse } from "next/server";
import { db } from "@/lib/db/db";
import { commentLikes } from "@/lib/schema";
import { checkUser } from "@/lib/db/checkInUser";
import { eq, and } from "drizzle-orm";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { commentId } = body as { commentId?: number };
    if (!commentId)
      return NextResponse.json({ error: "Missing commentId" }, { status: 400 });

    const me = await checkUser();
    if (!me)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const existing = await db
      .select()
      .from(commentLikes)
      .where(
        and(
          eq(commentLikes.userId, me.id),
          eq(commentLikes.commentId, commentId)
        )
      )
      .limit(1);
    if (existing.length) {
      const deleted = await db
        .delete(commentLikes)
        .where(eq(commentLikes.id, existing[0].id))
        .returning();
      return NextResponse.json(
        { success: true, data: { removed: deleted[0] } },
        { status: 200 }
      );
    }

    const inserted = await db
      .insert(commentLikes)
      .values({ userId: me.id, commentId })
      .returning();
    return NextResponse.json(
      { success: true, data: inserted[0] },
      { status: 201 }
    );
  } catch (err: unknown) {
    return NextResponse.json(
      { error: (err as Error).message ?? String(err) },
      { status: 500 }
    );
  }
}
