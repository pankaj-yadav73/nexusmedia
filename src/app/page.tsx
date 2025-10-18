
"use client";

import React, { useState } from "react";
import Headers from "@/components/headers";
import Footer from "@/components/footer";
import CreatePost from "@/components/CreatePost";
import PostCard from "@/components/PostCard";

type Post = {
  id: string;
  author: { name: string; avatar?: string };
  content: string;
  image?: string | null;
  likes: number;
  comments: number;
  createdAt: string;
};

const DUMMY_POSTS: Post[] = [
  {
    id: "p1",
    author: { name: "Alice", avatar: "/avatar1.png" },
    content: "Just discovered a great coffee shop in town! ☕️",
    image: null,
    likes: 12,
    comments: 3,
    createdAt: new Date().toISOString(),
  },
  {
    id: "p2",
    author: { name: "Bob", avatar: "/avatar2.png" },
    content: "Weekend road trip photos 🚗🌄",
    image: "/cars/mustang.jpg",
    likes: 45,
    comments: 10,
    createdAt: new Date().toISOString(),
  },
  {
    id: "p3",
    author: { name: "Chloe", avatar: "/avatar3.png" },
    content: "Trying out some new recipes tonight — homemade pasta! 🍝",
    image: null,
    likes: 8,
    comments: 1,
    createdAt: new Date().toISOString(),
  },
];

export default function Homepage() {
  const [posts, setPosts] = useState<Post[]>(DUMMY_POSTS);

  const handleNewPost = (post: Post) => {
    setPosts((p) => [post, ...p]);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 ">
      <main className="max-w-6xl mx-auto px-4 py-8 pt-24 grid grid-cols-1 md:grid-cols-3 gap-6">
        <section className="md:col-span-2 space-y-4">
          <CreatePost onPost={handleNewPost} />
          <div className="space-y-4">
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
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gray-100" />
                    <div>
                      <div className="font-semibold">Sneha</div>
                      <div className="text-xs text-gray-500">Photographer</div>
                    </div>
                  </div>
                  <button className="text-sm text-blue-600">Follow</button>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gray-100" />
                    <div>
                      <div className="font-semibold">Rohit</div>
                      <div className="text-xs text-gray-500">Developer</div>
                    </div>
                  </div>
                  <button className="text-sm text-blue-600">Follow</button>
                </div>
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
