import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { supabase } from "@/lib/supabase";
import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface Lineman {
    id: string;
    name: string;
    phone: string;
    zone: string;
    status: string;
    active_tasks?: number; // Added field
}

export default function Linemen() {
    const [linemen, setLinemen] = useState<Lineman[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchLinemen = async () => {
        setLoading(true);
        // Fetch users with role 'lineman'
        const { data: profiles, error } = await supabase
            .from("profiles")
            .select("*")
            .eq("role", "lineman");

        if (error) {
            toast.error("Failed to fetch linemen");
        } else {
            // Count active tasks
            const { data: activeIssues } = await supabase
                .from("issues")
                .select("assigned_to, status")
                .in("status", ["open", "in_progress", "assigned"]);

            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const linemenWithLoad = (profiles as any[])?.map((p: any) => {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                const count = (activeIssues as any[])?.filter((i: any) => i.assigned_to === p.id).length || 0;
                return { ...p, active_tasks: count };
            });

            setLinemen(linemenWithLoad || []);
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchLinemen();
    }, []);

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-3xl font-bold tracking-tight text-slate-900">Linemen Management</h2>
                <Button onClick={fetchLinemen} variant="outline" className="border-slate-300">Refresh</Button>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
                <Table>
                    <TableHeader className="bg-slate-50">
                        <TableRow>
                            <TableHead className="font-semibold text-slate-700">Name</TableHead>
                            <TableHead className="font-semibold text-slate-700">Phone</TableHead>
                            <TableHead className="font-semibold text-slate-700">Zone</TableHead>
                            <TableHead className="font-semibold text-slate-700">Current Load</TableHead>
                            <TableHead className="font-semibold text-slate-700">Status</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {loading ? (
                            <TableRow>
                                <TableCell colSpan={5} className="text-center py-8 text-slate-500">
                                    Loading...
                                </TableCell>
                            </TableRow>
                        ) : linemen.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={5} className="text-center py-8 text-slate-500">
                                    No linemen found.
                                </TableCell>
                            </TableRow>
                        ) : (
                            linemen.map((lineman) => (
                                <TableRow key={lineman.id} className="hover:bg-slate-50/50">
                                    <TableCell className="font-medium text-slate-900">{lineman.name}</TableCell>
                                    <TableCell className="text-slate-600">{lineman.phone}</TableCell>
                                    <TableCell className="text-slate-600">{lineman.zone || "N/A"}</TableCell>
                                    <TableCell>
                                        {lineman.active_tasks === 0 ? (
                                            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Free</Badge>
                                        ) : (
                                            <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
                                                {lineman.active_tasks} Active Task{lineman.active_tasks !== 1 && 's'}
                                            </Badge>
                                        )}
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant={lineman.status === 'active' ? 'default' : 'destructive'}>
                                            {lineman.status}
                                        </Badge>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}
