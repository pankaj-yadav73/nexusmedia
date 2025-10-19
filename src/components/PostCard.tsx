"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Heart } from "lucide-react";
import { getLikes, toggleLike as apiToggleLike } from "@/http/likes";
import { getComments, createComment } from "@/http/comments";
import { getShares, createShare } from "@/http/shares";
import type { Post } from "./CreatePost";

type Comment = {
    id: string | number;
    content: string;
    author?: { name?: string } | null;
};

const PostCard: React.FC<{ post: Post }> = ({ post }) => {

    const [liked, setLiked] = useState(false);
    const [likes, setLikes] = useState<number>(post.likes || 0);
    const [loadingLike, setLoadingLike] = useState(false);
    const [commentsOpen, setCommentsOpen] = useState(false);
    const [comments, setComments] = useState<Comment[]>([]);
    const [loadingComments, setLoadingComments] = useState(false);
    const [newComment, setNewComment] = useState("");
    const [sharesCount, setSharesCount] = useState<number>(0);
    const [sharing, setSharing] = useState(false);

    useEffect(() => {
        let mounted = true;
        (async () => {
            try {
                const res = await getLikes(Number(post.id));
                if (!mounted) return;
                if (res?.success && res.data) {
                    setLikes(res.data.count ?? 0);
                    setLiked(res.data.isLiked ?? false);
                }
                // fetch shares count
                try {
                    const s = await getShares(Number(post.id));
                    if (mounted && s?.success && s.data) {
                        setSharesCount(s.data.count ?? 0);
                    }
                } catch {
                    // ignore
                }
            } catch {
                // ignore
            }
        })();
        return () => { mounted = false; };
    }, [post.id]);

    const handleToggleLike = async () => {
        if (loadingLike) return;
        setLoadingLike(true);
        const prevLiked = liked;
        // optimistic
        setLiked(!prevLiked);
        setLikes((l) => (prevLiked ? l - 1 : l + 1));
        try {
            await apiToggleLike(Number(post.id));
            // sync with server
            const res = await getLikes(Number(post.id));
            if (res?.success && res.data) {
                setLikes(res.data.count ?? ((prevLiked ? likes - 1 : likes + 1)));
                setLiked(res.data.isLiked ?? !prevLiked);
            }
        } catch {
            // rollback on error
            setLiked(prevLiked);
            setLikes((l) => (prevLiked ? l + 1 : l - 1));
        } finally {
            setLoadingLike(false);
        }
    };

    const toggleComments = async () => {
        setCommentsOpen((v) => !v);
        if (!commentsOpen && comments.length === 0) {
            setLoadingComments(true);
            try {
                const res = await getComments(Number(post.id));
                if (res?.success && res.data) {
                    setComments(res.data.comments || res.data || []);
                }
            } catch {
                // ignore
            } finally {
                setLoadingComments(false);
            }
        }
    };

    const handlePostComment = async () => {
        if (!newComment.trim()) return;
        try {
            const res = await createComment(Number(post.id), newComment.trim());
            if (res?.success && res.data) {
                // prepend
                setComments((c) => [res.data, ...c]);
                setNewComment("");
            }
        } catch {
            // ignore
        }
    };

    const handleShare = async () => {
        if (sharing) return;
        setSharing(true);
        // optimistic
        setSharesCount((s) => s + 1);
        try {
            const res = await createShare(Number(post.id));
            if (res?.success && res.data) {
                setSharesCount(res.data.count ?? (sharesCount + 1));
            }
        } catch {
            // rollback
            setSharesCount((s) => s - 1);
        } finally {
            setSharing(false);
        }
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
                                // Ensure the parent has an explicit height so Next/Image with fixed dimensions can render.
                                <div className="mt-3 w-full h-64 rounded overflow-hidden bg-gray-100">
                                    {/* If the image is a blob or data URL (preview), Next/Image needs unoptimized to render locally */}
                                    {String(post.image).startsWith("blob:") || String(post.image).startsWith("data:") ? (
                                        <Image src={post.image as string} alt="post image" width={1200} height={720} className="object-cover w-full h-full" unoptimized />
                                    ) : (
                                        <Image src={post.image as string} alt="post image" width={1200} height={720} className="object-cover w-full h-full" />
                                    )}
                                </div>
                            )}
                        </Link>

                        <div className="mt-3 flex items-center gap-4">
                            <button onClick={handleToggleLike} className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                                <Heart className={`${liked ? "text-red-500" : ""}`} /> <span>{likes}</span>
                            </button>

                            <button onClick={toggleComments} className="text-sm text-gray-600 dark:text-gray-300">{(comments.length || post.comments) ?? 0} Comments</button>

                            <button onClick={handleShare} className="text-sm text-gray-600 dark:text-gray-300">{sharesCount} Share{sharesCount === 1 ? '' : 's'}</button>
                        </div>

                        {commentsOpen && (
                            <div className="mt-3 border-t pt-3">
                                <div className="mb-2">
                                    <textarea className="w-full p-2 border rounded" value={newComment} onChange={(e) => setNewComment(e.target.value)} placeholder="Write a comment..." />
                                    <div className="mt-2 flex gap-2">
                                        <button onClick={handlePostComment} className="px-3 py-1 bg-blue-600 text-white rounded text-sm">Comment</button>
                                        <button onClick={() => setCommentsOpen(false)} className="px-3 py-1 border rounded text-sm">Close</button>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    {loadingComments ? (
                                        <div className="text-sm text-gray-500">Loading comments...</div>
                                    ) : comments.length === 0 ? (
                                        <div className="text-sm text-gray-500">No comments yet</div>
                                    ) : (
                                        comments.map((c) => (
                                            <div key={c.id} className="p-2 bg-gray-50 dark:bg-gray-700 rounded">
                                                <div className="text-sm font-semibold">{c.author?.name ?? 'Unknown'}</div>
                                                <div className="text-sm text-gray-700 dark:text-gray-200">{c.content}</div>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </article>
    );
};

export default PostCard;
