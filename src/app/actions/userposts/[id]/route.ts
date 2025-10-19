import { NextResponse } from "next/server";
import { db } from "@/lib/db/db";
import { posts, users } from "@/lib/schema";
import { eq } from "drizzle-orm";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id?: string }> }
) {
  try {
    // Await params before accessing properties
    const { id } = await params;

    if (!id) {
      return NextResponse.json({ error: "Missing id" }, { status: 400 });
    }

    // Convert id to a number and validate. If your DB uses UUIDs, remove this conversion
    // and compare as strings instead (eq(posts.id, id)).
    const postId = Number(id);
    if (Number.isNaN(postId)) {
      return NextResponse.json({ error: "Invalid id" }, { status: 400 });
    }

    const rows = await db
      .select({
        id: posts.id,
        description: posts.description,
        Image: posts.Image,
        createdAt: posts.createdAt,
        userId: posts.userId,
        userName: users.name,
        userImage: users.image,
      })
      .from(posts)
      .leftJoin(users, eq(posts.userId, users.id))
      .where(eq(posts.id, postId));

    const row = rows[0];
    if (!row) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    return NextResponse.json({ data: row });
  } catch (err: unknown) {
    return NextResponse.json(
      { error: (err as Error).message ?? String(err) },
      { status: 500 }
    );
  }
}

// import { NextResponse } from "next/server";
// import { db } from "@/lib/db/db";
// import { posts, users } from "@/lib/schema";
// import { eq } from "drizzle-orm";

// export async function GET(
//   _req: Request,
//   { params }: { params: { id?: string } }
// ) {
//   try {
//     const id = params?.id;
//     if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

//     // Convert id to a number and validate. If your DB uses UUIDs, remove this conversion
//     // and compare as strings instead (eq(posts.id, id)).
//     const postId = Number(id);
//     if (Number.isNaN(postId))
//       return NextResponse.json({ error: "Invalid id" }, { status: 400 });
//     const rows = await db
//       .select({
//         id: posts.id,
//         description: posts.description,
//         Image: posts.Image,
//         createdAt: posts.createdAt,
//         userId: posts.userId,
//         userName: users.name,
//         userImage: users.image,
//       })
//       .from(posts)
//       .leftJoin(users, eq(posts.userId, users.id))
//       .where(eq(posts.id, postId));

//     const row = rows[0];
//     if (!row)
//       return NextResponse.json({ error: "Post not found" }, { status: 404 });

//     return NextResponse.json({ data: row });
//   } catch (err: unknown) {
//     return NextResponse.json(
//       { error: (err as Error).message ?? String(err) },
//       { status: 500 }
//     );
//   }
// }
