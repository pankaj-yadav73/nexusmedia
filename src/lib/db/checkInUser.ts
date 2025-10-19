import { db } from "./db";
import { users } from "../schema";
import { eq } from "drizzle-orm";
import { currentUser } from "@clerk/nextjs/server";

export const checkUser = async () => {
  const user = await currentUser();
  if (!user) {
    return null;
  }

  try {
    // Find existing user by clerkUserId
    const existingUser = await db
      .select()
      .from(users)
      .where(eq(users.clerkUserId, user.id))
      .limit(1);

    if (existingUser.length > 0) {
      return existingUser[0];
    }

    // Create new user if not found
    const first = user.firstName ?? "";
    const last = user.lastName ?? "";
    const name = (first || last) ? `${first} ${last}`.trim() : user.emailAddresses?.[0]?.emailAddress ?? user.primaryEmailAddress?.emailAddress ?? "Unknown";
    const email = user.emailAddresses?.[0]?.emailAddress ?? user.primaryEmailAddress?.emailAddress ?? null;

    const newUser = await db
      .insert(users)
      .values({
        clerkUserId: user.id,
        name,
        image: user.imageUrl ?? null,
        email: email ?? "",
        role: "customer",
      })
      .returning();

    return newUser[0];
  } catch (error) {
    console.log((error as Error).message);
    return null;
  }
};
