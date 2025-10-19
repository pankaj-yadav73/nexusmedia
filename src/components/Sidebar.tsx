"use client";

import React from "react";
import { Home, Users, Bell, Bookmark, Settings } from "lucide-react";
import Link from "next/link";

type TrendingTag = { name: string; posts: number };

const trendingHashtags: TrendingTag[] = [
    { name: "#Nextjs", posts: 1240 },
    { name: "#Tailwind", posts: 980 },
    { name: "#OpenSource", posts: 540 },
];

const Sidebar: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
    return (
        <>
            {isOpen && <div className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden" onClick={onClose} />}

            <aside
                className={`fixed left-0 top-16 bottom-0 w-80 text-center bg-white border-r border-gray-200 z-40 transition-transform lg:translate-x-0 ${isOpen ? "translate-x-0" : "-translate-x-full"
                    }`}
            >
                <nav className="p-4 space-y-2 ">
                    <Link href="/" className="w-full flex items-center gap-3 px-4 py-3 rounded-lg bg-blue-50 text-blue-600 font-semibold">
                        <Home className="w-5 h-5 text-center" />
                        Home
                    </Link>

                    <Link href="/network" className="w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-100 text-gray-700">
                        <Users className="w-5 h-5" />
                        Network
                    </Link>

                    <Link href="/notifications" className="w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-100 text-gray-700">
                        <Bell className="w-5 h-5" />
                        Notifications
                    </Link>

                    <Link href="/bookmarks" className="w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-100 text-gray-700">
                        <Bookmark className="w-5 h-5" />
                        Bookmarks
                    </Link>

                    <Link href="/settings" className="w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-100 text-gray-700">
                        <Settings className="w-5 h-5" />
                        Settings
                    </Link>
                </nav>

                <div className="p-4 border-t border-gray-200 mt-4">
                    <h3 className="font-semibold mb-3">Trending</h3>
                    <div className="space-y-3">
                        {trendingHashtags.map((tag, i) => (
                            <div key={i} className="cursor-pointer hover:bg-gray-50 p-2 rounded-lg">
                                <p className="font-semibold text-sm text-blue-600">{tag.name}</p>
                                <p className="text-xs text-gray-500">{tag.posts} posts</p>
                            </div>
                        ))}
                    </div>
                </div>
            </aside>
        </>
    );
};

export default Sidebar;
