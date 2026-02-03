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
import { RefreshCcw, Filter, Search } from "lucide-react";
import { Input } from "@/components/ui/input";

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
    const [searchQuery, setSearchQuery] = useState("");

    const fetchLinemenNames = async () => {
        const { data } = await supabase.from("profiles").select("id, name");
        if (data) {
            const map: Record<string, string> = {};
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
                return "bg-red-100 text-red-700 border-red-200 hover:bg-red-200";
            case "assigned":
                return "bg-blue-100 text-blue-700 border-blue-200 hover:bg-blue-200";
            case "in_progress":
                return "bg-orange-100 text-orange-700 border-orange-200 hover:bg-orange-200";
            case "resolved":
                return "bg-emerald-100 text-emerald-700 border-emerald-200 hover:bg-emerald-200";
            case "closed":
                return "bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200";
            default:
                return "bg-gray-100 text-gray-700 border-gray-200";
        }
    };

    const filteredIssues = issues.filter(issue =>
        issue.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (issue.address_text && issue.address_text.toLowerCase().includes(searchQuery.toLowerCase()))
    );

    return (
        <div className="space-y-6 py-6 animate-in fade-in duration-500">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-border/50 pb-6">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight text-foreground">Issues Management</h2>
                    <p className="text-muted-foreground mt-1">Track and assign reported issues.</p>
                </div>
                <div className="flex items-center gap-2">
                    <Button onClick={fetchIssues} variant="outline" className="gap-2 shadow-sm border-border bg-card hover:bg-muted transition-all">
                        <RefreshCcw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                        Refresh
                    </Button>
                </div>
            </div>

            <div className="flex items-center gap-4 bg-card p-4 rounded-xl border border-border shadow-sm">
                <div className="relative flex-1">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search issues..."
                        className="pl-9 bg-background border-border"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
                <Button variant="outline" className="gap-2">
                    <Filter className="h-4 w-4" />
                    Filter
                </Button>
            </div>

            <div className="rounded-xl border border-border bg-card shadow-md overflow-hidden">
                <Table>
                    <TableHeader className="bg-muted/50">
                        <TableRow className="hover:bg-muted/50 border-b border-border">
                            <TableHead className="font-semibold text-muted-foreground">Title</TableHead>
                            <TableHead className="font-semibold text-muted-foreground">Status</TableHead>
                            <TableHead className="font-semibold text-muted-foreground">Priority</TableHead>
                            <TableHead className="font-semibold text-muted-foreground">Location</TableHead>
                            <TableHead className="font-semibold text-muted-foreground">Assigned To</TableHead>
                            <TableHead className="font-semibold text-muted-foreground">Date</TableHead>
                            <TableHead className="text-right font-semibold text-muted-foreground">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {loading ? (
                            <TableRow>
                                <TableCell colSpan={7} className="text-center py-12 text-muted-foreground">
                                    <div className="flex flex-col items-center gap-2">
                                        <RefreshCcw className="h-8 w-8 animate-spin text-primary" />
                                        <p>Loading issues...</p>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ) : filteredIssues.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={7} className="text-center py-12 text-muted-foreground">
                                    No issues found matching your criteria.
                                </TableCell>
                            </TableRow>
                        ) : (
                            filteredIssues.map((issue) => (
                                <TableRow key={issue.id} className="hover:bg-muted/50 border-b border-border last:border-0 transition-colors">
                                    <TableCell className="font-medium text-foreground">{issue.title}</TableCell>
                                    <TableCell>
                                        <Badge variant="outline" className={`${getStatusColor(issue.status)} font-medium border`}>
                                            {issue.status.replace("_", " ").toUpperCase()}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant="outline" className={`capitalize border ${issue.priority === 'High' ? 'text-red-600 border-red-200 bg-red-50' :
                                            issue.priority === 'Medium' ? 'text-orange-600 border-orange-200 bg-orange-50' :
                                                'text-emerald-600 border-emerald-200 bg-emerald-50'
                                            }`}>
                                            {issue.priority}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="max-w-[200px] truncate text-muted-foreground" title={issue.address_text}>
                                        {issue.address_text || "N/A"}
                                    </TableCell>
                                    <TableCell className="text-muted-foreground">
                                        {issue.assigned_to ? (
                                            <span className="flex items-center gap-2">
                                                <span className="h-6 w-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-bold ring-1 ring-primary/20">
                                                    {(linemenMap[issue.assigned_to] || "?").charAt(0)}
                                                </span>
                                                {linemenMap[issue.assigned_to] || "Unknown"}
                                            </span>
                                        ) : (
                                            <span className="text-muted-foreground/50 italic text-sm">Unassigned</span>
                                        )}
                                    </TableCell>
                                    <TableCell className="text-muted-foreground text-sm">
                                        {new Date(issue.created_at).toLocaleDateString()}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        {!issue.assigned_to && issue.status !== 'resolved' && issue.status !== 'closed' && (
                                            <Button
                                                size="sm"
                                                onClick={() => handleAssignClick(issue.id)}
                                                className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-sm"
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
