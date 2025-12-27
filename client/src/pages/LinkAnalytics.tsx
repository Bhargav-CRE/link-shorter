import { useLink, useLinkAnalytics } from "@/hooks/use-links";
import { Link, useRoute } from "wouter";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell
} from "recharts";
import { ArrowLeft, MousePointer2, Globe, Smartphone, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { format, parseISO, startOfDay } from "date-fns";

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

export default function LinkAnalytics() {
  const [, params] = useRoute("/links/:alias");
  const alias = params?.alias || "";
  
  const { data: link, isLoading: isLinkLoading } = useLink(alias);
  const { data: analytics, isLoading: isAnalyticsLoading } = useLinkAnalytics(link?.id);

  const isLoading = isLinkLoading || isAnalyticsLoading;

  // Process data for charts
  const clicksOverTime = analytics?.reduce((acc, curr) => {
    if (!curr.timestamp) return acc;
    const date = format(parseISO(curr.timestamp.toString()), 'MMM dd');
    acc[date] = (acc[date] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const lineChartData = Object.entries(clicksOverTime || {}).map(([date, count]) => ({
    date,
    clicks: count
  }));

  const devices = analytics?.reduce((acc, curr) => {
    const device = curr.device || "Unknown";
    acc[device] = (acc[device] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const pieChartData = Object.entries(devices || {}).map(([name, value]) => ({
    name,
    value
  }));

  const countries = analytics?.reduce((acc, curr) => {
    const country = curr.country || "Unknown";
    acc[country] = (acc[country] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const barChartData = Object.entries(countries || {}).map(([name, value]) => ({
    name,
    value
  }));

  if (isLoading) {
    return <div className="p-8"><Skeleton className="h-96 w-full rounded-xl" /></div>;
  }

  if (!link) {
    return <div className="p-8 text-center">Link not found</div>;
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center gap-4">
        <Link href="/links">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="w-5 h-5" />
          </Button>
        </Link>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-3xl font-display font-bold text-foreground">/{link.alias}</h1>
            <span className="bg-primary/20 text-primary text-xs px-2 py-1 rounded-full font-medium">Active</span>
          </div>
          <p className="text-muted-foreground mt-1 truncate max-w-lg">{link.originalUrl}</p>
        </div>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-card border border-border p-6 rounded-xl">
          <div className="flex items-center gap-3 mb-2">
            <MousePointer2 className="w-5 h-5 text-primary" />
            <h3 className="font-medium text-muted-foreground">Total Clicks</h3>
          </div>
          <p className="text-3xl font-display font-bold">{analytics?.length || 0}</p>
        </div>
        <div className="bg-card border border-border p-6 rounded-xl">
          <div className="flex items-center gap-3 mb-2">
            <Globe className="w-5 h-5 text-accent" />
            <h3 className="font-medium text-muted-foreground">Top Country</h3>
          </div>
          <p className="text-3xl font-display font-bold">
            {barChartData.sort((a,b) => b.value - a.value)[0]?.name || "-"}
          </p>
        </div>
        <div className="bg-card border border-border p-6 rounded-xl">
          <div className="flex items-center gap-3 mb-2">
            <Smartphone className="w-5 h-5 text-emerald-500" />
            <h3 className="font-medium text-muted-foreground">Top Device</h3>
          </div>
          <p className="text-3xl font-display font-bold">
            {pieChartData.sort((a,b) => b.value - a.value)[0]?.name || "-"}
          </p>
        </div>
        <div className="bg-card border border-border p-6 rounded-xl">
          <div className="flex items-center gap-3 mb-2">
            <Calendar className="w-5 h-5 text-orange-500" />
            <h3 className="font-medium text-muted-foreground">Created</h3>
          </div>
          <p className="text-lg font-display font-bold mt-1">
            {new Date(link.createdAt!).toLocaleDateString()}
          </p>
        </div>
      </div>

      {/* Main Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Line Chart - Clicks over time */}
        <div className="lg:col-span-2 bg-card border border-border p-6 rounded-xl min-h-[400px]">
          <h3 className="font-display font-bold text-lg mb-6">Clicks Over Time</h3>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={lineChartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                <XAxis dataKey="date" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))', borderRadius: '8px' }}
                  itemStyle={{ color: 'white' }}
                />
                <Line 
                  type="monotone" 
                  dataKey="clicks" 
                  stroke="hsl(var(--primary))" 
                  strokeWidth={3}
                  dot={{ fill: 'hsl(var(--background))', strokeWidth: 2, r: 4 }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Pie Chart - Devices */}
        <div className="bg-card border border-border p-6 rounded-xl min-h-[400px]">
          <h3 className="font-display font-bold text-lg mb-6">Devices</h3>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieChartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {pieChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                   contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))', borderRadius: '8px' }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex flex-wrap gap-4 justify-center mt-4">
              {pieChartData.map((entry, index) => (
                <div key={entry.name} className="flex items-center gap-2 text-sm text-muted-foreground">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                  {entry.name}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Geography Chart */}
      <div className="bg-card border border-border p-6 rounded-xl">
        <h3 className="font-display font-bold text-lg mb-6">Geography</h3>
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={barChartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" vertical={false} />
              <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
              <Tooltip 
                cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))', borderRadius: '8px' }}
              />
              <Bar dataKey="value" fill="hsl(var(--accent))" radius={[4, 4, 0, 0]} barSize={40} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
