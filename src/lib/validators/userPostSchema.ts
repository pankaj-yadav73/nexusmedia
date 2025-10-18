import { z } from "zod";

export const isServer = typeof window === "undefined";

export const userPostSchema = z.object({
  title: z.string({ message: "P" }),
});
