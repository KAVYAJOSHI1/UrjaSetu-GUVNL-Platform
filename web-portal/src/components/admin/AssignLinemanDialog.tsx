
import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";

interface AssignLinemanDialogProps {
    issueId: string | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onAssigned: () => void;
}

interface Lineman {
    id: string;
    name: string;
    status: string;
    active_tasks: number;
}

export function AssignLinemanDialog({ issueId, open, onOpenChange, onAssigned }: AssignLinemanDialogProps) {
    const [linemen, setLinemen] = useState<Lineman[]>([]);
    const [selectedLineman, setSelectedLineman] = useState<string>("");
    const [loading, setLoading] = useState(false);
    const [assigning, setAssigning] = useState(false);

    useEffect(() => {
        if (open) {
            fetchLinemen();
            setSelectedLineman("");
        }
    }, [open]);

    const fetchLinemen = async () => {
        setLoading(true);
        // 1. Fetch all linemen
        const { data: profiles, error } = await supabase
            .from("profiles")
            .select("*")
            .eq("role", "lineman");

        if (error) {
            toast.error("Failed to fetch linemen");
            setLoading(false);
            return;
        }

        // 2. Fetch active issue counts for each lineman (Mocking this for now as local backend might not support complex joins/aggregates easily yet)
        // In a real Supabase/Postgres, we'd use a view or a join.
        // For local backend, we'll do a quick client-side count if possible, or just mock it to 0 for speed if 'issues' table is large.

        // Let's try to get all OPEN/IN_PROGRESS issues to count
        const { data: activeIssues } = await supabase
            .from("issues")
            .select("assigned_to, status")
            .in("status", ["open", "in_progress", "assigned"]);

        if (profiles) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const linemenWithLoad = (profiles as any[]).map((p: any) => {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                const count = (activeIssues as any[])?.filter((i: any) => i.assigned_to === p.id).length || 0;
                return { ...p, active_tasks: count };
            });
            setLinemen(linemenWithLoad);
        }
        setLoading(false);
    };

    const handleAssign = async () => {
        if (!issueId || !selectedLineman) return;

        setAssigning(true);
        const { error } = await supabase
            .from("issues")
            .update({
                assigned_to: selectedLineman,
                status: "assigned", // Update status to reflect assignment
                assigned_at: new Date().toISOString()
            })
            .eq("id", issueId);

        if (error) {
            toast.error("Failed to assign issue");
        } else {
            toast.success("Lineman assigned successfully");
            onAssigned();
            onOpenChange(false);
        }
        setAssigning(false);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Assign Lineman</DialogTitle>
                    <DialogDescription>
                        Select a qualified lineman to handle this issue.
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="lineman" className="text-right">
                            Worker
                        </Label>
                        <div className="col-span-3">
                            <Select value={selectedLineman} onValueChange={setSelectedLineman}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select a lineman..." />
                                </SelectTrigger>
                                <SelectContent>
                                    {loading ? (
                                        <div className="p-2 text-sm text-center text-muted-foreground">Loading...</div>
                                    ) : linemen.length === 0 ? (
                                        <div className="p-2 text-sm text-center text-muted-foreground">No linemen available</div>
                                    ) : (
                                        linemen.map((lineman) => (
                                            <SelectItem key={lineman.id} value={lineman.id} disabled={lineman.status !== 'active'}>
                                                <div className="flex items-center justify-between w-full gap-2">
                                                    <span>{lineman.name}</span>
                                                    {lineman.active_tasks === 0 ? (
                                                        <Badge variant="outline" className="text-[10px] bg-green-50 text-green-700 border-green-200">Free</Badge>
                                                    ) : (
                                                        <Badge variant="outline" className="text-[10px] bg-yellow-50 text-yellow-700 border-yellow-200">{lineman.active_tasks} Active</Badge>
                                                    )}
                                                </div>
                                            </SelectItem>
                                        ))
                                    )}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)} disabled={assigning}>Cancel</Button>
                    <Button onClick={handleAssign} disabled={!selectedLineman || assigning}>
                        {assigning ? "Assigning..." : "Confirm Assignment"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
