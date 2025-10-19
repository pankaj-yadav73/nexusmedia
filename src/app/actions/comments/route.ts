import { NextResponse } from "next/server";
import { db } from "@/lib/db/db";
import { comments, users } from "@/lib/schema";
import { checkUser } from "@/lib/db/checkInUser";
import { eq } from "drizzle-orm";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { postId, content, parentCommentId } = body as {
      postId?: number;
      content?: string;
      parentCommentId?: number | null;
    };

    if (!postId || !content)
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });

    const me = await checkUser();
    if (!me)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const inserted = await db
      .insert(comments)
      .values({
        userId: me.id,
        postId,
        content,
        parentCommentId: parentCommentId ?? null,
      })
      .returning();

    // fetch the created comment along with author info
    const rows = await db
      .select()
      .from(comments)
      .leftJoin(users, eq(comments.userId, users.id))
      .where(eq(comments.id, inserted[0].id))
      .limit(1);

    const joined = rows[0];
    const resp = {
      id: joined.comments.id,
      content: joined.comments.content,
      parentCommentId: joined.comments.parentCommentId,
      likesCount: joined.comments.likesCount,
      createdAt: joined.comments.createdAt,
      author: {
        id: joined.users?.id ?? null,
        name: joined.users?.name ?? "Unknown",
        avatar: joined.users?.image ?? null,
      },
    };

    return NextResponse.json({ success: true, data: resp }, { status: 201 });
  } catch (err: unknown) {
    return NextResponse.json(
      { error: (err as Error).message ?? String(err) },
      { status: 500 }
    );
  }
}

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const postId = url.searchParams.get("postId");
    if (!postId)
      return NextResponse.json({ error: "Missing postId" }, { status: 400 });

    const rows = await db
      .select()
      .from(comments)
      .leftJoin(users, eq(comments.userId, users.id))
      .where(eq(comments.postId, Number(postId)))
      .limit(200);

    const mapped = rows.map((r) => ({
      id: r.comments.id,
      content: r.comments.content,
      parentCommentId: r.comments.parentCommentId,
      likesCount: r.comments.likesCount,
      createdAt: r.comments.createdAt,
      author: {
        id: r.users?.id ?? null,
        name: r.users?.name ?? "Unknown",
        avatar: r.users?.image ?? null,
      },
    }));

    return NextResponse.json({ success: true, data: mapped }, { status: 200 });
  } catch (err: unknown) {
    return NextResponse.json(
      { error: (err as Error).message ?? String(err) },
      { status: 500 }
    );
  }
}
