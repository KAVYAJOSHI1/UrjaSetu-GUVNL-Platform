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
import { AssignLinemanDialog } from "@/components/admin/AssignLinemanDialog";
import { useRealtime } from "@/hooks/useRealtime";

interface Issue {
    id: string;
    title: string;
    status: string;
    priority: string;
    created_at: string;
    address_text: string;
    assigned_to: string | null;
}

export default function Issues() {
    const [issues, setIssues] = useState<Issue[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedIssueId, setSelectedIssueId] = useState<string | null>(null);
    const [assignDialogOpen, setAssignDialogOpen] = useState(false);
    const [linemenMap, setLinemenMap] = useState<Record<string, string>>({});

    const fetchLinemenNames = async () => {
        const { data } = await supabase.from("profiles").select("id, name");
        if (data) {
            const map: Record<string, string> = {};
            (data as any[]).forEach((p: any) => { map[p.id] = p.name; });
            setLinemenMap(map);
        }
    };

    const fetchIssues = async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from("issues")
            .select("*")
            .order("created_at", { ascending: false });

        if (error) {
            toast.error("Failed to fetch issues");
        } else {
            setIssues((data as any) || []);
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchIssues();
        fetchLinemenNames();
    }, []);

    // Listen for changes on 'issues' table
    useRealtime('issues', () => {
        fetchIssues();
    });

    const handleAssignClick = (issueId: string) => {
        setSelectedIssueId(issueId);
        setAssignDialogOpen(true);
    };

    const handleAssigned = () => {
        fetchIssues(); // Refresh list to show new status/assignment
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case "open":
                return "bg-red-500 hover:bg-red-600 border-red-500";
            case "assigned":
                return "bg-blue-500 hover:bg-blue-600 border-blue-500";
            case "in_progress":
                return "bg-orange-500 hover:bg-orange-600 border-orange-500";
            case "resolved":
                return "bg-green-500 hover:bg-green-600 border-green-500";
            case "closed":
                return "bg-gray-500 hover:bg-gray-600 border-gray-500";
            default:
                return "bg-gray-500";
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-3xl font-bold tracking-tight text-slate-900">Issues Management</h2>
                <Button onClick={fetchIssues} variant="outline" className="border-slate-300">Refresh</Button>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
                <Table>
                    <TableHeader className="bg-slate-50">
                        <TableRow>
                            <TableHead className="font-semibold text-slate-700">Title</TableHead>
                            <TableHead className="font-semibold text-slate-700">Status</TableHead>
                            <TableHead className="font-semibold text-slate-700">Priority</TableHead>
                            <TableHead className="font-semibold text-slate-700">Location</TableHead>
                            <TableHead className="font-semibold text-slate-700">Assigned To</TableHead>
                            <TableHead className="font-semibold text-slate-700">Date</TableHead>
                            <TableHead className="text-right font-semibold text-slate-700">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {loading ? (
                            <TableRow>
                                <TableCell colSpan={7} className="text-center py-8 text-slate-500">
                                    Loading...
                                </TableCell>
                            </TableRow>
                        ) : issues.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={7} className="text-center py-8 text-slate-500">
                                    No issues found.
                                </TableCell>
                            </TableRow>
                        ) : (
                            issues.map((issue) => (
                                <TableRow key={issue.id} className="hover:bg-slate-50/50">
                                    <TableCell className="font-medium text-slate-900">{issue.title}</TableCell>
                                    <TableCell>
                                        <Badge className={`${getStatusColor(issue.status)} text-white`}>
                                            {issue.status.replace("_", " ").toUpperCase()}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant="outline" className="capitalize text-slate-600 border-slate-300">
                                            {issue.priority}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="max-w-[200px] truncate text-slate-600" title={issue.address_text}>
                                        {issue.address_text || "N/A"}
                                    </TableCell>
                                    <TableCell className="text-slate-600">
                                        {issue.assigned_to ? (
                                            <span className="flex items-center gap-2">
                                                <span className="h-6 w-6 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-xs font-bold">
                                                    {(linemenMap[issue.assigned_to] || "?").charAt(0)}
                                                </span>
                                                {linemenMap[issue.assigned_to] || "Unknown"}
                                            </span>
                                        ) : (
                                            <span className="text-slate-400 italic">Unassigned</span>
                                        )}
                                    </TableCell>
                                    <TableCell className="text-slate-600">
                                        {new Date(issue.created_at).toLocaleDateString()}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        {!issue.assigned_to && issue.status !== 'resolved' && issue.status !== 'closed' && (
                                            <Button
                                                size="sm"
                                                onClick={() => handleAssignClick(issue.id)}
                                                className="bg-indigo-600 hover:bg-indigo-700 text-white"
                                            >
                                                Assign
                                            </Button>
                                        )}
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>

            <AssignLinemanDialog
                issueId={selectedIssueId}
                open={assignDialogOpen}
                onOpenChange={setAssignDialogOpen}
                onAssigned={handleAssigned}
            />
        </div>
    );
}
