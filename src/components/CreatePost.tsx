"use client";

import React, { useState } from "react";
import Image from "next/image";

export type Post = {
    id: string;
    author: { id?: string; name: string; avatar?: string };
    content: string;
    image?: string | null;
    likes: number;
    comments: number;
    createdAt: string;
};

type Props = {
    onPost?: (post: Post) => void;
};

const CreatePost: React.FC<Props> = ({ onPost }) => {
    const [text, setText] = useState("");
    const [file, setFile] = useState<File | null>(null);
    const [preview, setPreview] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [isPublic, setIsPublic] = useState(true);

    const handlePost = async () => {
        if (!text.trim()) return;
        setLoading(true);
        try {
            const form = new FormData();
            form.append("content", text);
            form.append("isPublic", isPublic ? "true" : "false");
            if (file) form.append("image", file);

            const res = await fetch("/actions/userposts", {
                method: "POST",
                body: form,
            });

            const json = await res.json();
            if (!res.ok) throw new Error(json?.error || "Failed to create post");

            // server returns { success: true, data: newPostRow }
            const row = json?.data;
            const newPost: Post = {
                id: String(row?.id ?? Date.now()),
                author: { id: "", name: "You", avatar: "/avatar.png" },
                content: row?.description ?? text,
                image: row?.Image ?? null,
                likes: 0,
                comments: 0,
                createdAt: row?.createdAt ?? new Date().toISOString(),
            };

            onPost?.(newPost);
            setText("");
            setFile(null);
            setPreview(null);
        } catch (err: unknown) {
            console.error("CreatePost error:", (err as Error)?.message ?? String(err));
            // optionally show UI error to the user
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4 shadow-sm">
            <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="What's happening?"
                className="w-full min-h-[80px] resize-none p-3 border rounded-md focus:outline-none focus:ring"
            />
            <div className="flex items-center justify-between mt-3">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                    <label className="px-2 py-1 rounded hover:bg-gray-100 cursor-pointer">
                        <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => {
                                const f = e.target.files?.[0] ?? null;
                                setFile(f);
                                if (f) setPreview(URL.createObjectURL(f));
                                else setPreview(null);
                            }}
                        />
                        {file ? "Change Image" : "Add Image"}
                    </label>
                    <button className="px-2 py-1 rounded hover:bg-gray-100" onClick={() => setIsPublic((v) => !v)}>
                        {isPublic ? "Public" : "Private"}
                    </button>
                </div>
                <button
                    onClick={handlePost}
                    disabled={!text.trim() || loading}
                    className="bg-blue-600 text-white px-4 py-2 rounded disabled:opacity-50"
                >
                    {loading ? "Posting..." : "Post"}
                </button>
            </div>
            {preview && (
                <div className="mt-3 relative w-full h-48">
                    <Image src={preview} alt="preview" unoptimized fill className="object-contain rounded-md" />
                </div>
            )}
        </div>
    );
};

export default CreatePost;
