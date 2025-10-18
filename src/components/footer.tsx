import React from "react";
import Link from "next/link";

const Footer: React.FC = () => {
    return (
        <footer className="w-full border-t bg-white dark:bg-gray-900">
            <div className="mx-auto max-w-7xl px-4 py-8 flex flex-col md:flex-row items-center justify-between">
                <div className="text-sm text-gray-600 dark:text-gray-300">© {new Date().getFullYear()} NexusMedia. All rights reserved.</div>
                <div className="flex items-center gap-4 mt-4 md:mt-0">
                    <Link href="/about" className="text-sm text-gray-600 hover:text-gray-900 dark:text-gray-300">About</Link>
                    <Link href="/terms" className="text-sm text-gray-600 hover:text-gray-900 dark:text-gray-300">Terms</Link>
                    <Link href="/privacy" className="text-sm text-gray-600 hover:text-gray-900 dark:text-gray-300">Privacy</Link>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
