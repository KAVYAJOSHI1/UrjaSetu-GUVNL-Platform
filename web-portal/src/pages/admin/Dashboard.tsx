import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/lib/supabase";
import { useEffect, useState, useMemo } from "react";
import { AlertCircle, CheckCircle, Clock, Zap, RefreshCcw, MapPin, Activity } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix for default marker icon
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});

L.Marker.prototype.options.icon = DefaultIcon;

interface Issue {
    id: string;
    title: string;
    status: 'open' | 'assigned' | 'in_progress' | 'resolved' | 'closed';
    priority: string;
    created_at: string;
    address_text: string;
    location?: string;
}

interface IssueLocation {
    id: string;
    title: string;
    lat: number;
    lng: number;
    status: string;
    address: string;
}

export default function Dashboard() {
    const [issues, setIssues] = useState<Issue[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchData = async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from("issues")
            .select("*")
            .order("created_at", { ascending: false });

        if (error) {
            toast.error("Failed to update dashboard");
        } else {
            setIssues((data as any[]) || []);
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchData();
    }, []);

    // Derived State Calculations
    const stats = useMemo(() => {
        const total = issues.length;
        const open = issues.filter(i => i.status === 'open').length;
        const in_progress = issues.filter(i => i.status === 'in_progress' || i.status === 'assigned').length;
        const resolved = issues.filter(i => i.status === 'resolved' || i.status === 'closed').length;
        return { total, open, in_progress, resolved };
    }, [issues]);

    const graphData = useMemo(() => [
        { name: 'Open', count: stats.open, fill: '#f97316' },
        { name: 'In Progress', count: stats.in_progress, fill: '#3b82f6' },
        { name: 'Resolved', count: stats.resolved, fill: '#22c55e' },
    ], [stats]);

    const locations = useMemo(() => {
        return issues
            .filter(i => i.location && i.status !== 'closed' && i.status !== 'resolved') // Show active issues
            .map(i => {
                try {
                    const loc = JSON.parse(i.location!);
                    // Handle various coordinate formats
                    const lat = loc.coords?.latitude || loc.latitude || loc.lat;
                    const lng = loc.coords?.longitude || loc.longitude || loc.lng;

                    if (!lat || !lng) return null;

                    return {
                        id: i.id,
                        title: i.title,
                        lat: Number(lat),
                        lng: Number(lng),
                        status: i.status,
                        address: i.address_text
                    };
                } catch (e) { return null; }
            })
            .filter((i): i is IssueLocation => i !== null);
    }, [issues]);

    const recentActivity = useMemo(() => issues.slice(0, 5), [issues]);

    const mapCenter: [number, number] = [23.2156, 72.6369]; // Gandhinagar Default

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight text-slate-900">Dashboard</h2>
                    <p className="text-slate-500">Overview of field operations and issue resolution.</p>
                </div>
                <Button onClick={fetchData} variant="outline" className="gap-2 border-slate-300 hover:bg-slate-100 transition-all">
                    <RefreshCcw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                    Refresh Data
                </Button>
            </div>

            {/* Stats Grid */}
            <div className="grid gap-4 md:grid-cols-4">
                <Card className="border-slate-200 shadow-sm bg-white hover:shadow-md transition-shadow">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-slate-600">Total Issues</CardTitle>
                        <Activity className="h-4 w-4 text-slate-400" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-slate-900">{stats.total}</div>
                        <p className="text-xs text-slate-500 mt-1">All time reports</p>
                    </CardContent>
                </Card>
                <Card className="border-orange-100 bg-gradient-to-br from-white to-orange-50 shadow-sm hover:shadow-md transition-shadow">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-orange-900">Attention Needed</CardTitle>
                        <AlertCircle className="h-4 w-4 text-orange-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-orange-700">{stats.open}</div>
                        <p className="text-xs text-orange-600/80 mt-1">Open status</p>
                    </CardContent>
                </Card>
                <Card className="border-blue-100 bg-gradient-to-br from-white to-blue-50 shadow-sm hover:shadow-md transition-shadow">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-blue-900">In Progress</CardTitle>
                        <Clock className="h-4 w-4 text-blue-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-blue-700">{stats.in_progress}</div>
                        <p className="text-xs text-blue-600/80 mt-1">Technicians assigned</p>
                    </CardContent>
                </Card>
                <Card className="border-emerald-100 bg-gradient-to-br from-white to-emerald-50 shadow-sm hover:shadow-md transition-shadow">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-emerald-900">Resolved</CardTitle>
                        <CheckCircle className="h-4 w-4 text-emerald-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-emerald-700">{stats.resolved}</div>
                        <p className="text-xs text-emerald-600/80 mt-1">Successfully closed</p>
                    </CardContent>
                </Card>
            </div>

            {/* Main Content Grid */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">

                {/* Chart Section */}
                <Card className="col-span-4 border-slate-200 shadow-sm">
                    <CardHeader>
                        <CardTitle className="text-slate-800">Status Distribution</CardTitle>
                    </CardHeader>
                    <CardContent className="pl-2">
                        <div className="h-[350px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={graphData} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                                    <XAxis
                                        dataKey="name"
                                        tick={{ fill: '#64748b', fontSize: 12 }}
                                        axisLine={{ stroke: '#e2e8f0' }}
                                        tickLine={false}
                                        dy={10}
                                    />
                                    <YAxis
                                        allowDecimals={false}
                                        tick={{ fill: '#64748b', fontSize: 12 }}
                                        axisLine={false}
                                        tickLine={false}
                                    />
                                    <Tooltip
                                        cursor={{ fill: '#f1f5f9' }}
                                        contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                                    />
                                    <Bar dataKey="count" radius={[6, 6, 0, 0]} barSize={60}>
                                        {graphData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.fill} />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </CardContent>
                </Card>

                {/* Recent Activity */}
                <Card className="col-span-3 border-slate-200 shadow-sm flex flex-col">
                    <CardHeader>
                        <CardTitle className="text-slate-800">Recent Activity</CardTitle>
                    </CardHeader>
                    <CardContent className="flex-1">
                        <div className="space-y-6">
                            {recentActivity.length === 0 ? (
                                <p className="text-sm text-slate-500 text-center py-8">No recent activity.</p>
                            ) : (
                                recentActivity.map((issue) => (
                                    <div key={issue.id} className="flex items-start gap-4 pb-4 border-b last:border-0 border-slate-100">
                                        <div className={`mt-1 p-2 rounded-full shrink-0 ${issue.status === 'open' ? 'bg-orange-100 text-orange-600' :
                                                issue.status === 'resolved' ? 'bg-emerald-100 text-emerald-600' :
                                                    'bg-blue-100 text-blue-600'
                                            }`}>
                                            {issue.status === 'open' ? <AlertCircle size={16} /> :
                                                issue.status === 'resolved' ? <CheckCircle size={16} /> :
                                                    <Clock size={16} />}
                                        </div>
                                        <div className="space-y-1">
                                            <p className="text-sm font-medium text-slate-900 leading-none">{issue.title}</p>
                                            <p className="text-xs text-slate-500 line-clamp-1">{issue.address_text || "No location provided"}</p>
                                            <p className="text-[10px] text-slate-400 capitalize">
                                                {new Date(issue.created_at).toLocaleDateString()} • {issue.priority} Priority
                                            </p>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </CardContent>
                </Card>

                {/* Heatmap Section - Now Full Width */}
                <Card className="col-span-7 border-slate-200 shadow-sm overflow-hidden">
                    <CardHeader>
                        <div className="flex justify-between items-center">
                            <CardTitle className="text-slate-800">Active Issue Hotspots</CardTitle>
                            <div className="flex items-center gap-2 text-sm text-slate-500">
                                <MapPin size={16} />
                                <span>Showing active issues only</span>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="p-0 h-[400px] relative z-0">
                        <MapContainer
                            center={mapCenter}
                            zoom={12}
                            scrollWheelZoom={false}
                            style={{ height: "100%", width: "100%" }}
                        >
                            <TileLayer
                                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                            />
                            {locations.map(loc => (
                                <Marker key={loc.id} position={[loc.lat, loc.lng]}>
                                    <Popup>
                                        <div className="p-2 min-w-[200px]">
                                            <strong className="block text-sm font-bold text-slate-900 mb-1">{loc.title}</strong>
                                            <span className="text-xs text-slate-500 block mb-2">{loc.address}</span>
                                            <div className="flex gap-2">
                                                <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${loc.status === 'open' ? 'bg-orange-100 text-orange-700' :
                                                        loc.status === 'resolved' ? 'bg-emerald-100 text-emerald-700' : 'bg-blue-100 text-blue-700'
                                                    }`}>
                                                    {loc.status.toUpperCase()}
                                                </span>
                                            </div>
                                        </div>
                                    </Popup>
                                </Marker>
                            ))}
                        </MapContainer>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
