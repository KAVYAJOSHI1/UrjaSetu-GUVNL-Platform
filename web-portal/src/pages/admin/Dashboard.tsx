import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/lib/supabase";
import { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom"; // Add import
import { AlertCircle, CheckCircle, Clock, RefreshCcw, Activity, ArrowUpRight } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import 'leaflet.heat'; // Import heatmap plugin
import { useRealtime } from "@/hooks/useRealtime";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

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

// Heatmap Layer Component
function HeatmapLayer({ points }: { points: [number, number, number][] }) {
    const map = useMap();

    useEffect(() => {
        if (!points.length) return;

        // @ts-ignore - leaflet.heat adds heatLayer to L
        const heat = L.heatLayer(points, {
            radius: 25,
            blur: 15,
            maxZoom: 10,
            max: 1.0,
            gradient: {
                0.4: 'blue',
                0.6: 'cyan',
                0.7: 'lime',
                0.8: 'yellow',
                1.0: 'red'
            }
        }).addTo(map);

        return () => {
            map.removeLayer(heat);
        };
    }, [map, points]);

    return null;
}

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
    status: 'open' | 'assigned' | 'in_progress' | 'resolved' | 'closed';
    address: string;
}

export default function Dashboard() {
    const [issues, setIssues] = useState<Issue[]>([]);
    const [loading, setLoading] = useState(true);
    const [showHeatmap, setShowHeatmap] = useState(false);
    const navigate = useNavigate(); // Add hook

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

    // Real-time updates
    useRealtime('issues', () => {
        fetchData();
    });

    // Derived State Calculations
    const stats = useMemo(() => {
        const total = issues.length;
        const open = issues.filter(i => i.status === 'open').length;
        const in_progress = issues.filter(i => i.status === 'in_progress' || i.status === 'assigned').length;
        const resolved = issues.filter(i => i.status === 'resolved' || i.status === 'closed').length;
        return { total, open, in_progress, resolved };
    }, [issues]);

    const graphData = useMemo(() => [
        { name: 'Open', count: stats.open, fill: '#ef4444' }, // Red-500
        { name: 'In Progress', count: stats.in_progress, fill: '#f59e0b' }, // Amber-500
        { name: 'Resolved', count: stats.resolved, fill: '#10b981' }, // Emerald-500
    ], [stats]);

    const locations = useMemo(() => {
        return issues
            .filter(i => i.location && i.status !== 'closed' && i.status !== 'resolved') // Show active issues
            .map(i => {
                let lat, lng;
                try {
                    // Try parsing as JSON first
                    const loc = JSON.parse(i.location!);
                    lat = loc.coords?.latitude || loc.latitude || loc.lat;
                    lng = loc.coords?.longitude || loc.longitude || loc.lng;
                } catch (e) {
                    // Fallback: Parse WKT POINT format (POINT(lng lat))
                    // Example: POINT(72.6369 23.2156)
                    const matches = i.location!.match(/POINT\s*\(([^ ]+)\s+([^ ]+)\)/);
                    if (matches) {
                        lng = parseFloat(matches[1]);
                        lat = parseFloat(matches[2]);
                    }
                }

                if (!lat || !lng || isNaN(lat) || isNaN(lng)) return null;

                return {
                    id: i.id,
                    title: i.title,
                    lat: Number(lat),
                    lng: Number(lng),
                    status: i.status,
                    address: i.address_text
                };
            })
            .filter((i): i is IssueLocation => i !== null);
    }, [issues]);

    // Heatmap Data
    const heatmapPoints = useMemo(() => {
        return locations.map(loc => {
            let intensity = 0.6;
            if (loc.status === 'open') intensity = 1.0;
            if (loc.title.toLowerCase().includes('fire') || loc.title.toLowerCase().includes('spark')) intensity = 1.0;
            return [loc.lat, loc.lng, intensity] as [number, number, number];
        });
    }, [locations]);

    // Calculate Map Bounds to auto-center
    const mapBounds = useMemo(() => {
        if (locations.length === 0) return null;
        const lats = locations.map(l => l.lat);
        const lngs = locations.map(l => l.lng);
        const minLat = Math.min(...lats);
        const maxLat = Math.max(...lats);
        const minLng = Math.min(...lngs);
        const maxLng = Math.max(...lngs);
        // Add some padding
        return [
            [minLat - 0.01, minLng - 0.01],
            [maxLat + 0.01, maxLng + 0.01]
        ] as [[number, number], [number, number]];
    }, [locations]);

    // Component to update view when bounds change
    function ChangeView({ bounds }: { bounds: [[number, number], [number, number]] | null }) {
        const map = useMap();
        useEffect(() => {
            if (bounds) {
                map.fitBounds(bounds);
            }
        }, [bounds, map]);
        return null;
    }

    const recentActivity = useMemo(() => issues.slice(0, 5), [issues]);

    const mapCenter: [number, number] = [23.2156, 72.6369]; // Gandhinagar Default

    return (
        <div className="space-y-8 animate-in fade-in duration-500 py-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-border/50 pb-6">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight text-foreground">Overview</h2>
                    <p className="text-muted-foreground mt-1">Real-time insights into field operations and grid health.</p>
                </div>
                <Button onClick={fetchData} variant="outline" className="gap-2 shadow-sm border-border bg-card hover:bg-muted transition-all">
                    <RefreshCcw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                    Refresh Data
                </Button>
            </div>

            {/* Stats Grid */}
            <div className="grid gap-6 md:grid-cols-4">
                <Card className="border-none shadow-md bg-white relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                        <Activity className="h-24 w-24 text-primary" />
                    </div>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 z-10">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Total Reports</CardTitle>
                    </CardHeader>
                    <CardContent className="z-10 relative">
                        <div className="text-3xl font-bold text-foreground">{stats.total}</div>
                        <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                            <ArrowUpRight className="h-3 w-3 text-emerald-500" />
                            <span className="text-emerald-500 font-medium">+12%</span> from last month
                        </p>
                    </CardContent>
                </Card>

                <Card className="border-none shadow-md bg-white relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                        <AlertCircle className="h-24 w-24 text-destructive" />
                    </div>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 z-10">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Critical Issues</CardTitle>
                    </CardHeader>
                    <CardContent className="z-10 relative">
                        <div className="text-3xl font-bold text-destructive">{stats.open}</div>
                        <p className="text-xs text-muted-foreground mt-1">Requires immediate attention</p>
                    </CardContent>
                </Card>

                <Card className="border-none shadow-md bg-white relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                        <Clock className="h-24 w-24 text-orange-500" />
                    </div>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 z-10">
                        <CardTitle className="text-sm font-medium text-muted-foreground">In Progress</CardTitle>
                    </CardHeader>
                    <CardContent className="z-10 relative">
                        <div className="text-3xl font-bold text-orange-600">{stats.in_progress}</div>
                        <p className="text-xs text-muted-foreground mt-1">Technicians dispatched</p>
                    </CardContent>
                </Card>

                <Card className="border-none shadow-md bg-white relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                        <CheckCircle className="h-24 w-24 text-emerald-500" />
                    </div>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 z-10">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Resolved</CardTitle>
                    </CardHeader>
                    <CardContent className="z-10 relative">
                        <div className="text-3xl font-bold text-emerald-600">{stats.resolved}</div>
                        <p className="text-xs text-muted-foreground mt-1">Operations completed</p>
                    </CardContent>
                </Card>
            </div>

            {/* Main Content Grid */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">

                {/* Chart Section */}
                <Card className="col-span-4 border-none shadow-md">
                    <CardHeader>
                        <CardTitle>Resolution Status</CardTitle>
                    </CardHeader>
                    <CardContent className="pl-2">
                        <div className="h-[350px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={graphData} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                    <XAxis
                                        dataKey="name"
                                        tick={{ fill: '#64748b', fontSize: 12 }}
                                        axisLine={{ stroke: '#f1f5f9' }}
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
                                        cursor={{ fill: '#f8fafc' }}
                                        contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                                    />
                                    <Bar dataKey="count" radius={[6, 6, 0, 0]} barSize={50}>
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
                <Card className="col-span-3 border-none shadow-md flex flex-col">
                    <CardHeader>
                        <CardTitle>Live Activity Feed</CardTitle>
                    </CardHeader>
                    <CardContent className="flex-1 overflow-y-auto pr-2 custom-scrollbar max-h-[400px]">
                        <div className="space-y-6">
                            {recentActivity.length === 0 ? (
                                <p className="text-sm text-muted-foreground text-center py-8">No recent activity.</p>
                            ) : (
                                recentActivity.map((issue) => (
                                    <div key={issue.id} className="flex items-start gap-4 pb-4 border-b border-border/50 last:border-0 group hover:bg-slate-50 p-2 rounded-lg transition-colors">
                                        <div className={`mt-1 p-2 rounded-full shrink-0 ${issue.status === 'open' ? 'bg-red-50 text-destructive' :
                                            issue.status === 'resolved' ? 'bg-emerald-50 text-emerald-600' :
                                                'bg-blue-50 text-blue-600'
                                            }`}>
                                            {issue.status === 'open' ? <AlertCircle size={16} /> :
                                                issue.status === 'resolved' ? <CheckCircle size={16} /> :
                                                    <Clock size={16} />}
                                        </div>
                                        <div className="space-y-1 w-full">
                                            <div className="flex justify-between items-center">
                                                <p className="text-sm font-semibold text-foreground leading-none">{issue.title}</p>
                                                <span className="text-[10px] text-muted-foreground bg-slate-100 px-2 py-0.5 rounded-full">
                                                    {new Date(issue.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                </span>
                                            </div>
                                            <p className="text-xs text-muted-foreground line-clamp-1">{issue.address_text || "No location provided"}</p>
                                            <div className="flex items-center gap-2 mt-1">
                                                <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded border ${issue.priority === 'High' ? 'border-red-200 text-red-600 bg-red-50' :
                                                    issue.priority === 'Medium' ? 'border-orange-200 text-orange-600 bg-orange-50' :
                                                        'border-emerald-200 text-emerald-600 bg-emerald-50'
                                                    }`}>
                                                    {issue.priority}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </CardContent>
                </Card>

                {/* Heatmap Section */}
                <Card className="col-span-7 border-none shadow-md overflow-hidden min-h-[500px] flex flex-col">
                    <CardHeader className="flex flex-row items-center justify-between border-b border-border/50 bg-card py-4">
                        <div className="space-y-1">
                            <CardTitle className="text-lg font-bold">Geospatial Overview</CardTitle>
                            <p className="text-sm text-muted-foreground">Live tracking of reported issues across the grid.</p>
                        </div>
                        <div className="flex items-center gap-4">
                            <div className="flex items-center space-x-2 bg-muted/30 px-3 py-1.5 rounded-lg border border-border">
                                <Switch
                                    id="heatmap-mode"
                                    checked={showHeatmap}
                                    onCheckedChange={setShowHeatmap}
                                    className="data-[state=checked]:bg-primary"
                                />
                                <Label htmlFor="heatmap-mode" className="text-sm font-medium cursor-pointer">Heatmap View</Label>
                            </div>

                            {!showHeatmap && (
                                <div className="flex gap-2">
                                    <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground bg-muted/50 px-3 py-1.5 rounded-full border border-border">
                                        <span className="h-2 w-2 rounded-full bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]"></span> Critical
                                    </div>
                                    <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground bg-muted/50 px-3 py-1.5 rounded-full border border-border">
                                        <span className="h-2 w-2 rounded-full bg-orange-500 shadow-[0_0_8px_rgba(249,115,22,0.5)]"></span> Major
                                    </div>
                                    <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground bg-muted/50 px-3 py-1.5 rounded-full border border-border">
                                        <span className="h-2 w-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]"></span> Resolved
                                    </div>
                                </div>
                            )}
                        </div>
                    </CardHeader>
                    <CardContent className="p-0 flex-1 relative z-0">
                        <MapContainer
                            center={mapCenter}
                            zoom={13}
                            scrollWheelZoom={false}
                            style={{ height: "100%", width: "100%", minHeight: "500px" }}
                            className="z-0"
                        >
                            {/* Premium Light Tiles: CartoDB Positron */}
                            <TileLayer
                                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
                                url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
                            />
                            <ChangeView bounds={mapBounds} />

                            {showHeatmap ? (
                                <HeatmapLayer points={heatmapPoints} />
                            ) : (
                                locations.map(loc => {
                                    // Create custom marker icons based on status/priority
                                    const isCritical = loc.status === 'open' || loc.title.toLowerCase().includes('spark') || loc.title.toLowerCase().includes('fire');
                                    const isResolved = loc.status === 'resolved' || loc.status === 'closed';

                                    const colorClass = isResolved ? 'bg-emerald-500' : isCritical ? 'bg-red-500' : 'bg-blue-500';
                                    const shadowColor = isResolved ? 'rgba(16, 185, 129, 0.4)' : isCritical ? 'rgba(239, 68, 68, 0.4)' : 'rgba(59, 130, 246, 0.4)';

                                    const customIcon = L.divIcon({
                                        className: 'custom-map-marker',
                                        html: `<div style="
                                            background-color: white;
                                            border-radius: 50%;
                                            padding: 4px;
                                            box-shadow: 0 4px 12px ${shadowColor};
                                            display: flex;
                                            align-items: center;
                                            justify-content: center;
                                            width: 32px;
                                            height: 32px;
                                            border: 2px solid white;
                                        ">
                                            <div class="${colorClass}" style="width: 100%; height: 100%; border-radius: 50%;"></div>
                                        </div>`,
                                        iconSize: [32, 32],
                                        iconAnchor: [16, 32],
                                        popupAnchor: [0, -32]
                                    });

                                    return (
                                        <Marker key={loc.id} position={[loc.lat, loc.lng]} icon={customIcon}>
                                            <Popup className="premium-popup">
                                                <div className="p-1 min-w-[220px]">
                                                    <div className="flex items-center justify-between mb-2">
                                                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${isResolved ? 'bg-emerald-100 text-emerald-700' :
                                                                isCritical ? 'bg-red-100 text-red-700' :
                                                                    'bg-blue-100 text-blue-700'
                                                            }`}>
                                                            {loc.status.replace('_', ' ')}
                                                        </span>
                                                        <span className="text-[10px] text-muted-foreground">{new Date().toLocaleDateString()}</span>
                                                    </div>
                                                    <h4 className="font-bold text-sm text-foreground mb-1 leading-tight">{loc.title}</h4>
                                                    <p className="text-xs text-muted-foreground mb-3 line-clamp-2">{loc.address}</p>
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        className="w-full h-7 text-xs border-primary/20 hover:bg-primary/5 text-primary"
                                                        onClick={() => navigate('/admin/issues')}
                                                    >
                                                        View Details
                                                    </Button>
                                                </div>
                                            </Popup>
                                        </Marker>
                                    );
                                })
                            )}
                        </MapContainer>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
