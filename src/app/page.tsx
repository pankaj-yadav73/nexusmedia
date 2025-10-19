
"use client";

import React, { useState, useEffect } from "react";
import CreatePost from "@/components/CreatePost";
import PostCard from "@/components/PostCard";
import { followUser, unfollowUser, getFollowSuggestions } from "@/http/follow";

type Post = {
  id: string;
  author: { name: string; avatar?: string };
  content: string;
  image?: string | null;
  likes: number;
  comments: number;
  createdAt: string;
};

const DUMMY_POSTS: Post[] = [];

export default function Homepage() {
  const [whoToFollow, setWhoToFollow] = useState<
    Array<{
      id: number;
      name: string;
      image?: string | null;
      followerCount: number;
      isFollowing: boolean;
      loading?: boolean;
    }>
  >([]);
  type Suggestion = {
    id: number;
    name: string;
    image?: string | null;
    followerCount: number;
    isFollowing: boolean;
  };

  useEffect(() => {
    let mounted = true;
    const fetchSuggestions = async () => {
      try {
        const res = await getFollowSuggestions();
        if (mounted && res?.data) {
          setWhoToFollow(
            (res.data as Suggestion[]).map((s) => ({ ...s, loading: false }))
          );
        }
      } catch (err) {
        console.error("Failed to load suggestions", err);
      }
    };

    fetchSuggestions();
    return () => {
      mounted = false;
    };
  }, []);

  const toggleFollow = async (id: number) => {
    setWhoToFollow((prev) => prev.map((u) => (u.id === id ? { ...u, loading: true } : u)));
    const user = whoToFollow.find((u) => u.id === id);
    try {
      if (!user) throw new Error("User not found");
      if (user.isFollowing) {
        await unfollowUser(id);
        setWhoToFollow((prev) => prev.map((u) => (u.id === id ? { ...u, isFollowing: false, loading: false } : u)));
      } else {
        await followUser(id);
        setWhoToFollow((prev) => prev.map((u) => (u.id === id ? { ...u, isFollowing: true, loading: false } : u)));
      }
    } catch (err) {
      console.error("Follow action failed", err);
      setWhoToFollow((prev) => prev.map((u) => (u.id === id ? { ...u, loading: false } : u)));
    }
  };
  const [posts, setPosts] = useState<Post[]>(DUMMY_POSTS);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const handleNewPost = (post: Post) => {
    setPosts((p) => [post, ...p]);
  };

  useEffect(() => {
    let mounted = true;

    const fetchPosts = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch("/actions/userposts");
        const json = await res.json();
        if (!res.ok) throw new Error(json?.error || "Failed to fetch posts");

        const rows = json.data as unknown[];
        const mapped: Post[] = rows.map((r) => {
          const row = r as Record<string, unknown>;
          return {
            id: String(row["id"] ?? ""),
            author: { id: String(row["userId"] ?? ""), name: String(row["userName"] ?? "Unknown"), avatar: String(row["userImage"] ?? "/avatar.png") },
            content: String(row["description"] ?? ""),
            image: (row["Image"] ?? null) as string | null,
            likes: 0,
            comments: 0,
            createdAt: String(row["createdAt"] ?? new Date().toISOString()),
          } as Post;
        });
        if (mounted) setPosts(mapped);
      } catch (err: unknown) {
        setError((err as Error)?.message ?? String(err));
      } finally {
        if (mounted) setLoading(false);
      }
    };

    fetchPosts();
    return () => {
      mounted = false;
    };
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 ">
      <main className="max-w-6xl mx-auto px-4 py-8 pt-24 grid grid-cols-1 md:grid-cols-3 gap-6">
        <section className="md:col-span-2 space-y-4">
          <CreatePost onPost={handleNewPost} />
          <div className="space-y-4">
            {loading && <div className="p-4 text-center text-gray-500">Loading posts...</div>}
            {error && <div className="p-4 text-center text-red-500">{error}</div>}
            {!loading && !error && posts.length === 0 && (
              <div className="p-4 text-center text-gray-500">No posts yet — be the first to post!</div>
            )}
            {posts.map((post) => (
              <PostCard key={post.id} post={post} />
            ))}
          </div>
        </section>

        <aside className="hidden md:block">
          <div className="sticky top-28 space-y-4">
            <div className="bg-white dark:bg-gray-800 border rounded-lg p-4">
              <h3 className="font-semibold">Who to follow</h3>
              <div className="mt-3 space-y-3">
                {whoToFollow.map((u) => (
                  <div key={u.id} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gray-100" />
                      <div>
                        <div className="font-semibold">{u.name}</div>
                        <div className="text-xs text-gray-500">{u.followerCount} followers</div>
                      </div>
                    </div>
                    <button
                      onClick={() => toggleFollow(u.id)}
                      disabled={u.loading}
                      className="text-sm text-blue-600 disabled:opacity-50"
                    >
                      {u.loading ? "..." : u.isFollowing ? "Following" : "Follow"}
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
              <h3 className="font-semibold">Trending</h3>
              <ul className="mt-3 space-y-2 text-sm text-gray-600">
                <li>#Nextjs</li>
                <li>#Tailwind</li>
                <li>#OpenSource</li>
              </ul>
            </div>
          </div>
        </aside>
      </main>
    </div>
  );
}
