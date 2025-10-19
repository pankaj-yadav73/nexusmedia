"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
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
                    <Link href={`/users/${post.author.id ?? ''}`}>
                        <Image
                            src={post.author.avatar ?? "/avatar.svg"}
                            alt={post.author.name}
                            width={48}
                            height={48}
                            className="object-cover rounded-full"
                        />
                    </Link>
                </div>
                <div className="flex-1">
                    <div className="flex items-center justify-between">
                        <div>
                            <div className="font-semibold">
                                <Link href={`/users/${post.author.id ?? ''}`} className="text-gray-900 dark:text-gray-100">{post.author.name}</Link>
                            </div>
                            <div className="text-xs text-gray-500">{new Date(post.createdAt).toLocaleString()}</div>
                        </div>
                    </div>

                    <div className="mt-3">
                        <Link href={`/posts/${post.id}`} className="block text-gray-800 dark:text-gray-100">
                            <p className="leading-relaxed">{post.content}</p>

                            {post.image && (
                                <div className="mt-3 w-full max-h-[420px] relative rounded overflow-hidden bg-gray-100">
                                    {/* If the image is a blob or data URL (preview), Next/Image needs unoptimized to render locally */}
                                    {String(post.image).startsWith("blob:") || String(post.image).startsWith("data:") ? (
                                        <Image src={post.image as string} alt="post image" fill className="object-cover" unoptimized />
                                    ) : (
                                        <Image src={post.image as string} alt="post image" fill className="object-cover" />
                                    )}
                                </div>
                            )}
                        </Link>

                        <div className="mt-3 flex items-center gap-4">
                            <button onClick={toggleLike} className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                                <Heart className={`${liked ? "text-red-500" : ""}`} /> <span>{likes}</span>
                            </button>
                            <div className="text-sm text-gray-600 dark:text-gray-300">{post.comments} Comments</div>
                        </div>
                    </div>
                </div>
            </div>
        </article>
    );
};

export default PostCard;
