"use client";

import React from "react";
import { Button } from "./ui/button";
import { Heart, CarFront } from "lucide-react";
import Link from "next/link";
import { SignedIn, SignedOut, SignInButton, UserButton, useUser } from "@clerk/nextjs";
import Image from "next/image";
import { ModeToggle } from "./ui/darkmood";

type Props = {
    isAdminPage?: boolean;
};

const Headers: React.FC<Props> = ({ isAdminPage = false }) => {
    const { user } = useUser();
    return (
        <header className="fixed top-0 w-full bg-white/90 dark:bg-gray-900/80 backdrop-blur-md z-50 border-b border-gray-200 dark:border-gray-700">
            <nav className="mx-auto max-w-7xl px-4 py-4 flex items-center justify-between">
                <Link href={isAdminPage ? "/admin" : "/"} className="flex items-center gap-3">
                    <Image src="/logo.png" alt="Logo" width={160} height={40} className="h-10 w-auto object-contain" />
                    {isAdminPage && <span className="text-xs font-extralight">admin</span>}
                </Link>

                <div className="flex items-center space-x-4">
                    <SignedIn>
                        <Link href="/reservations" className="text-gray-600 hover:text-blue-600 flex items-center gap-2">
                            <Button variant="outline">
                                <CarFront size={18} />
                                <span className="hidden md:inline">My Reservations</span>
                            </Button>
                        </Link>

                        <a href="/saved-cars">
                            <Button className="flex items-center gap-2">
                                <Heart size={18} />
                                <span className="hidden md:inline">Saved Cars</span>
                            </Button>
                        </a>
                    </SignedIn>

                    <SignedOut>
                        {!isAdminPage && (
                            <SignInButton forceRedirectUrl="/">
                                <Button variant="outline">Login</Button>
                            </SignInButton>
                        )}
                    </SignedOut>

                    <SignedIn>
                        {/* Clickable avatar that redirects to profile page */}
                        {user ? (
                            <Link href={`/users/${user.id}`} className="block rounded-full overflow-hidden w-10 h-10">
                                <Image
                                    src={user.imageUrl ?? "/avatar.png"}
                                    alt={user.fullName ?? "Profile"}
                                    width={40}
                                    height={40}
                                    className="object-cover rounded-full"
                                />
                            </Link>
                        ) : null}

                        <UserButton
                            appearance={{
                                elements: {
                                    avatarBox: "w-10 h-10",
                                },
                            }}
                        />
                    </SignedIn>
                    <div>
                        <ModeToggle />
                    </div>
                </div>
            </nav>
        </header>
    );
};

export default Headers;
