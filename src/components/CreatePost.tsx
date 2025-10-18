"use client";

import React, { useState } from "react";

export type Post = {
    id: string;
    author: { name: string; avatar?: string };
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

    const handlePost = () => {
        if (!text.trim()) return;
        const newPost: Post = {
            id: Date.now().toString(),
            author: { name: "You", avatar: "/avatar.png" },
            content: text,
            image: null,
            likes: 0,
            comments: 0,
            createdAt: new Date().toISOString(),
        };
        onPost?.(newPost);
        setText("");
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
                    <button className="px-2 py-1 rounded hover:bg-gray-100">Add Image</button>
                    <button className="px-2 py-1 rounded hover:bg-gray-100">Add Tag</button>
                </div>
                <button
                    onClick={handlePost}
                    disabled={!text.trim()}
                    className="bg-blue-600 text-white px-4 py-2 rounded disabled:opacity-50"
                >
                    Post
                </button>
            </div>
        </div>
    );
};

export default CreatePost;
