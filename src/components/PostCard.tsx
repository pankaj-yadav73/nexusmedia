"use client";

import React, { useState } from "react";
import Image from "next/image";
import { Heart } from "lucide-react";
import type { Post } from "./CreatePost";

const PostCard: React.FC<{ post: Post }> = ({ post }) => {
    const [liked, setLiked] = useState(false);
    const [likes, setLikes] = useState<number>(post.likes || 0);

    const toggleLike = () => {
        setLiked(!liked);
        setLikes((l) => (liked ? l - 1 : l + 1));
    };

    return (
        <article className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4 shadow-sm">
            <div className="flex items-start gap-3">
                <div className="w-12 h-12 relative rounded-full overflow-hidden bg-gray-100">
                    <Image src={post.author.avatar || "/avatar.png"} alt={post.author.name} fill className="object-cover" />
                </div>
                <div className="flex-1">
                    <div className="flex items-center justify-between">
                        <div>
                            <div className="font-semibold">{post.author.name}</div>
                            <div className="text-xs text-gray-500">{new Date(post.createdAt).toLocaleString()}</div>
                        </div>
                    </div>

                    <p className="mt-3 text-gray-800 dark:text-gray-100">{post.content}</p>

                    {post.image && (
                        <div className="mt-3 w-full h-60 relative rounded overflow-hidden bg-gray-100">
                            <Image src={post.image} alt="post image" fill className="object-cover" />
                        </div>
                    )}

                    <div className="mt-3 flex items-center gap-4">
                        <button onClick={toggleLike} className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                            <Heart className={`${liked ? "text-red-500" : ""}`} /> {likes} Likes
                        </button>
                        <div className="text-sm text-gray-600 dark:text-gray-300">{post.comments} Comments</div>
                    </div>
                </div>
            </div>
        </article>
    );
};

export default PostCard;
