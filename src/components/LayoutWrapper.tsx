"use client";

import React, { useState } from "react";
import Headers from "@/components/headers";
import Footer from "@/components/footer";
import Sidebar from "@/components/Sidebar";

export default function LayoutWrapper({ children }: { children: React.ReactNode }) {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    return (
        <>
            <Headers onToggleSidebar={() => setIsSidebarOpen((v) => !v)} />
            <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
            {children}
            <Footer />
        </>
    );
}
