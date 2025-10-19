import { NextResponse } from "next/server";
import { db } from "@/lib/db/db";
import { shares } from "@/lib/schema";
import { checkUser } from "@/lib/db/checkInUser";
import { eq } from "drizzle-orm";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { postId, caption } = body as { postId?: number; caption?: string };
    if (!postId)
      return NextResponse.json({ error: "Missing postId" }, { status: 400 });

    const me = await checkUser();
    if (!me)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const inserted = await db
      .insert(shares)
      .values({ userId: me.id, postId, caption: caption ?? null })
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

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const postId = url.searchParams.get("postId");
    if (!postId)
      return NextResponse.json({ error: "Missing postId" }, { status: 400 });

    const rows = await db
      .select()
      .from(shares)
      .where(eq(shares.postId, Number(postId)))
      .limit(200);
    return NextResponse.json({ success: true, data: rows }, { status: 200 });
  } catch (err: unknown) {
    return NextResponse.json(
      { error: (err as Error).message ?? String(err) },
      { status: 500 }
    );
  }
}
