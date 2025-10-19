import { db } from "@/lib/db/db";
import { posts, users, likes, comments, shares } from "@/lib/schema";
import { currentUser } from "@clerk/nextjs/server";
import { NextResponse, NextRequest } from "next/server";
import { eq } from "drizzle-orm";
import { getServerImage } from "@/lib/db/imagekit";

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

    // Parse FormData instead of JSON for file uploads
    const imagekit = getServerImage();

    const formData = await req.formData();
    const content = formData.get("content") as string;
    const image = formData.get("image") as File | null;
    const video = formData.get("video") as File | null;
    const isPublic = formData.get("isPublic") === "true";

    if (!content || content.trim() === "") {
      return NextResponse.json(
        { error: "Content is required" },
        { status: 400 }
      );
    }

    let imageUrl: string | null = null;
    let videoUrl: string | null = null;

    // Upload image to ImageKit
    if (image) {
      try {
        const bytes = await image.arrayBuffer();
        const buffer = Buffer.from(bytes);

        const uploadResponse = await imagekit.upload({
          file: buffer,
          fileName: `post-${Date.now()}-${image.name}`,
          folder: "/posts/images",
        });

        imageUrl = uploadResponse.url;
      } catch (uploadError) {
        console.error("Image upload error:", uploadError);
        return NextResponse.json(
          { error: "Failed to upload image" },
          { status: 500 }
        );
      }
    }

    // Upload video to ImageKit
    if (video) {
      try {
        const bytes = await video.arrayBuffer();
        const buffer = Buffer.from(bytes);

        const uploadResponse = await imagekit.upload({
          file: buffer,
          fileName: `post-${Date.now()}-${video.name}`,
          folder: "/posts/videos",
        });

        videoUrl = uploadResponse.url;
      } catch (uploadError) {
        console.error("Video upload error:", uploadError);
        return NextResponse.json(
          { error: "Failed to upload video" },
          { status: 500 }
        );
      }
    }

    const newPost = await db
      .insert(posts)
      .values({
        userId: dbUser[0].id,
        description: content,
        Image: imageUrl || null,
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
    console.error("Post creation error:", error);
    return NextResponse.json(
      { error: "Failed to create post" },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    // Join posts with users to return author info
    const rows = await db
      .select({
        id: posts.id,
        description: posts.description,
        image: posts.Image,
        userId: posts.userId,
        createdAt: posts.createdAt,
        userName: users.name,
        userImage: users.image,
      })
      .from(posts)
      .leftJoin(users, eq(posts.userId, users.id))
      .limit(50);

    // Enrich each post with counts (likes/comments/shares)
    const enriched = await Promise.all(
      rows.map(async (r) => {
        const postId = r.id;
        const likesRows = await db
          .select()
          .from(likes)
          .where(eq(likes.postId, postId));
        const commentsRows = await db
          .select()
          .from(comments)
          .where(eq(comments.postId, postId));
        const sharesRows = await db
          .select()
          .from(shares)
          .where(eq(shares.postId, postId));

        return {
          id: r.id,
          description: r.description,
          image: r.image ?? null,
          userId: r.userId,
          createdAt: r.createdAt,
          userName: r.userName,
          userImage: r.userImage,
          likes: likesRows.length,
          comments: commentsRows.length,
          shares: sharesRows.length,
        };
      })
    );

    return NextResponse.json(
      { success: true, data: enriched },
      { status: 200 }
    );
  } catch (err) {
    console.error("Failed to fetch posts", err);
    return NextResponse.json(
      { error: "Failed to fetch posts" },
      { status: 500 }
    );
  }
}
