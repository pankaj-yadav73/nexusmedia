"use client";

import React, { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { getUserProfile } from "@/http/users";
import PostCard from "@/components/PostCard";

type Profile = {
    user: { id: number; name: string; image?: string | null; email?: string };
    posts: Array<{ id: number; description: string; Image?: string | null; createdAt: string }>;
    followerCount: number;
    followingCount: number;
    isFollowing: boolean;
};

export default function UserProfile() {
    const pathname = usePathname();
    const parts = pathname.split("/");
    const id = parts[parts.length - 1];

    const [profile, setProfile] = useState<Profile | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let mounted = true;
        const fetchProfile = async () => {
            setLoading(true);
            try {
                const res = await getUserProfile(id);
                if (mounted && res?.data) {
                    setProfile(res.data);
                }
            } catch (err) {
                console.error("Failed to fetch profile", err);
            } finally {
                if (mounted) setLoading(false);
            }
        };

        fetchProfile();
        return () => {
            mounted = false;
        };
    }, [id]);

    if (loading) return <div className="p-4">Loading profile...</div>;
    if (!profile) return <div className="p-4">Profile not found</div>;

    return (
        <div className="max-w-4xl mx-auto p-4 mt-16">
            <div className="flex items-center gap-4 mb-6">
                <div className="w-20 h-20 rounded-full bg-gray-100 overflow-hidden">
                    {profile.user.image ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={profile.user.image} alt={profile.user.name} className="w-full h-full object-cover" />
                    ) : null}
                </div>
                <div>
                    <div className="text-2xl font-semibold">{profile.user.name}</div>
                    <div className="text-sm text-gray-500">{profile.user.email}</div>
                    <div className="text-sm text-gray-600 mt-1">
                        {profile.followerCount} followers · {profile.followingCount} following
                    </div>
                </div>
            </div>

            <section>
                <h3 className="font-semibold mb-3">Posts</h3>
                <div className="space-y-4">
                    {profile.posts.length === 0 && <div className="text-gray-500">No posts yet</div>}
                    {profile.posts.map((p) => (
                        <PostCard
                            key={String(p.id)}
                            post={{
                                id: String(p.id),
                                author: { name: profile.user.name },
                                content: p.description || "",
                                image: p.Image || null,
                                likes: 0,
                                comments: 0,
                                createdAt: p.createdAt?.toString() || new Date().toISOString(),
                            }}
                        />
                    ))}
                </div>
            </section>
        </div>
    );
}
