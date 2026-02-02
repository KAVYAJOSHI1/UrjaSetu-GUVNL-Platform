import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

export default function AdminLogin() {
    const [email, setEmail] = useState("admin@urjasetu.com");
    const [password, setPassword] = useState("password123");
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const { data, error } = await supabase.auth.signInWithPassword({
                email,
                password,
            });

            if (error) {
                throw error;
            }

            // Check if user has admin role
            const { data: profile, error: profileError } = await supabase
                .from("profiles")
                .select("role")
                .eq("id", data.user.id)
                .single();

            /*
            if (profileError || profile?.role !== "admin") {
                await supabase.auth.signOut();
                toast.error("Access denied. Admin privileges required.");
                return;
            }
            */
            toast.success("Welcome back, Admin (Dev Mode)!");
            navigate("/admin");
        } catch (error: unknown) {
            toast.error((error as Error).message || "Failed to login");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-900 via-slate-900 to-black p-4">
            <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))]" />
            <Card className="relative w-full max-w-md border-slate-800 bg-black/40 backdrop-blur-xl text-slate-100 shadow-2xl ring-1 ring-white/10">
                <CardHeader className="space-y-3 pb-8 text-center bg-gradient-to-b from-white/5 to-transparent">
                    <div className="mx-auto box-content h-12 w-12 rounded-xl bg-gradient-to-tr from-blue-500 to-cyan-400 p-[2px] shadow-lg shadow-blue-500/20">
                        <div className="flex h-full w-full items-center justify-center rounded-[10px] bg-black">
                            <span className="text-xl font-bold text-white">U</span>
                        </div>
                    </div>
                    <CardTitle className="text-3xl font-bold tracking-tight text-white">UrjaSetu Admin</CardTitle>
                    <CardDescription className="text-slate-400 text-base">
                        Secure access for authorized personnel
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6 pt-6">
                    <form onSubmit={handleLogin} className="space-y-5">
                        <div className="space-y-2">
                            <Label htmlFor="email" className="text-sm font-medium text-slate-300">Email Address</Label>
                            <Input
                                id="email"
                                type="email"
                                placeholder="admin@urjasetu.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="bg-white/5 border-white/10 text-white placeholder:text-slate-500 focus:bg-white/10 focus:border-blue-500/50 transition-all h-11"
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <Label htmlFor="password" className="text-sm font-medium text-slate-300">Password</Label>
                            </div>
                            <Input
                                id="password"
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="bg-white/5 border-white/10 text-white focus:bg-white/10 focus:border-blue-500/50 transition-all h-11"
                                required
                            />
                        </div>
                        <Button
                            type="submit"
                            className="w-full h-11 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white font-semibold shadow-lg shadow-blue-500/20 transition-all active:scale-[0.98]"
                            disabled={loading}
                        >
                            {loading ? (
                                <div className="flex items-center gap-2">
                                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/20 border-t-white" />
                                    <span>Authenticating...</span>
                                </div>
                            ) : (
                                "Sign In to Dashboard"
                            )}
                        </Button>
                    </form>
                    <div className="text-center text-xs text-slate-500 mt-6">
                        Protected by UrjaSetu Secure Gateway
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
