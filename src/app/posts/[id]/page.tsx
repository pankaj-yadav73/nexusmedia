"use client";

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import PostCard from "@/components/PostCard";
import { fetchPostById, ApiPostRow } from "@/lib/fetchapi";

type Post = {
    id: string;
    author: { name: string; avatar?: string };
    content: string;
    image?: string | null;
    likes: number;
    comments: number;
    createdAt: string;
};

export default function PostPage() {
    const params = useParams();
    const id = params?.id as string | undefined;
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [post, setPost] = useState<Post | null>(null);

    useEffect(() => {
        if (!id) return;
        let mounted = true;
        setLoading(true);
        setError(null);

        fetchPostById(id)
            .then((res) => {
                const row = res.data as ApiPostRow;
                const mapped: Post = {
                    id: String(row.id ?? ""),
                    author: { name: String(row.userName ?? "Unknown"), avatar: (row.userImage ?? undefined) as string | undefined },
                    content: String(row.description ?? ""),
                    image: (row.Image ?? null) as string | null,
                    likes: 0,
                    comments: 0,
                    createdAt: String(row.createdAt ?? new Date().toISOString()),
                };
                if (mounted) setPost(mapped);
            })
            .catch((err) => setError(err?.message ?? String(err)))
            .finally(() => mounted && setLoading(false));

        return () => {
            mounted = false;
        };
    }, [id]);

    if (!id) return <div className="p-6">No post id provided.</div>;
    if (loading) return <div className="p-6">Loading post...</div>;
    if (error) return <div className="p-6 text-red-500">{error}</div>;
    if (!post) return <div className="p-6">Post not found.</div>;

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pt-24">
            <main className="max-w-3xl mx-auto px-4 py-8">
                <PostCard post={post} />
            </main>
        </div>
    );
}
