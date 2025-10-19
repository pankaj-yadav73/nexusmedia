import { NextResponse } from "next/server";
import { db } from "@/lib/db/db";
import { comments } from "@/lib/schema";
import { checkUser } from "@/lib/db/checkInUser";
import { eq } from "drizzle-orm";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id?: string }> }
) {
  try {
    const { id } = await params;
    if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

    const me = await checkUser();
    if (!me)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    const { content } = body as { content?: string };
    if (!content)
      return NextResponse.json({ error: "Missing content" }, { status: 400 });

    // Ensure comment belongs to user
    const existing = await db
      .select()
      .from(comments)
      .where(eq(comments.id, Number(id)))
      .limit(1);
    if (!existing.length)
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    if (existing[0].userId !== me.id)
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const updated = await db
      .update(comments)
      .set({ content, updatedAt: new Date() })
      .where(eq(comments.id, Number(id)))
      .returning();
    return NextResponse.json(
      { success: true, data: updated[0] },
      { status: 200 }
    );
  } catch (err: unknown) {
    return NextResponse.json(
      { error: (err as Error).message ?? String(err) },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id?: string }> }
) {
  try {
    const { id } = await params;
    if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

    const me = await checkUser();
    if (!me)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const existing = await db
      .select()
      .from(comments)
      .where(eq(comments.id, Number(id)))
      .limit(1);
    if (!existing.length)
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    if (existing[0].userId !== me.id)
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const deleted = await db
      .delete(comments)
      .where(eq(comments.id, Number(id)))
      .returning();
    return NextResponse.json(
      { success: true, data: deleted[0] },
      { status: 200 }
    );
  } catch (err: unknown) {
    return NextResponse.json(
      { error: (err as Error).message ?? String(err) },
      { status: 500 }
    );
  }
}
