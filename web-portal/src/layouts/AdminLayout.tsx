import { Outlet, Navigate } from "react-router-dom";
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/admin/AppSidebar";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export default function AdminLayout() {
    const [isAdmin, setIsAdmin] = useState<boolean | null>(null);

    useEffect(() => {
        const checkAuth = async () => {
            const { data: { session } } = await supabase.auth.getSession();

            if (!session) {
                setIsAdmin(false);
                return;
            }

            const { data: profile } = await supabase
                .from("profiles")
                .select("role")
                .eq("id", session.user.id)
                .single();

            // FOR DEV: Allow access if logged in, regardless of role
            if (session) {
                setIsAdmin(true);
            } else {
                setIsAdmin(false);
            }
            /*
            if (profile?.role === "admin") {
                setIsAdmin(true);
            } else {
                setIsAdmin(false);
            }
            */
        };

        checkAuth();
    }, []);

    if (isAdmin === null) {
        return <div className="flex items-center justify-center h-screen">Loading...</div>;
    }

    if (isAdmin === false) {
        return <Navigate to="/admin/login" replace />;
    }

    return (
        <SidebarProvider>
            <AppSidebar />
            <SidebarInset>
                <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
                    <SidebarTrigger className="-ml-1" />
                    <div className="h-4 w-px bg-gray-200" />
                    <h1 className="text-sm font-medium">Admin Portal</h1>
                </header>
                <div className="flex-1 overflow-auto p-4 md:p-6 lg:p-8">
                    <Outlet />
                </div>
            </SidebarInset>
        </SidebarProvider>
    );
}
