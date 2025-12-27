import { useLinks } from "@/hooks/use-links";
import { CreateLinkDialog } from "@/components/CreateLinkDialog";
import { Link } from "wouter";
import { 
  BarChart3, 
  ExternalLink, 
  Copy, 
  Globe, 
  Clock, 
  MousePointer2, 
  ArrowUpRight 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";

export default function Dashboard() {
  const { data: links, isLoading } = useLinks();
  const { toast } = useToast();

  const totalClicks = links?.reduce((acc, link) => acc + (link.clicks || 0), 0) || 0;
  const activeLinks = links?.length || 0;

  const copyToClipboard = (alias: string) => {
    const url = `${window.location.protocol}//${window.location.host}/r/${alias}`;
    navigator.clipboard.writeText(url);
    toast({
      title: "Copied!",
      description: "Short link copied to clipboard",
    });
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold text-foreground">Dashboard</h1>
          <p className="text-muted-foreground mt-1">Overview of your link performance</p>
        </div>
        <CreateLinkDialog />
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-card border border-border rounded-2xl p-6 relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <MousePointer2 className="w-24 h-24 text-primary" />
          </div>
          <div className="relative z-10">
            <p className="text-muted-foreground font-medium mb-1">Total Clicks</p>
            {isLoading ? (
              <Skeleton className="h-10 w-24" />
            ) : (
              <h2 className="text-4xl font-display font-bold text-foreground">{totalClicks.toLocaleString()}</h2>
            )}
            <div className="flex items-center gap-1 text-emerald-500 text-sm mt-2 font-medium">
              <ArrowUpRight className="w-4 h-4" /> +12% this week
            </div>
          </div>
        </div>

        <div className="bg-card border border-border rounded-2xl p-6 relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <Link className="w-24 h-24 text-accent" />
          </div>
          <div className="relative z-10">
            <p className="text-muted-foreground font-medium mb-1">Active Links</p>
            {isLoading ? (
              <Skeleton className="h-10 w-24" />
            ) : (
              <h2 className="text-4xl font-display font-bold text-foreground">{activeLinks}</h2>
            )}
            <div className="flex items-center gap-1 text-emerald-500 text-sm mt-2 font-medium">
              <PlusCircleIcon className="w-4 h-4" /> {links?.length ? 'Growing' : 'Start now'}
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-primary to-accent rounded-2xl p-6 text-white relative overflow-hidden">
          <div className="relative z-10">
            <h3 className="font-display font-bold text-lg mb-2">Upgrade to Pro</h3>
            <p className="text-white/80 text-sm mb-4">Unlock detailed geography analytics and custom domains.</p>
            <Button variant="secondary" size="sm" className="bg-white/10 hover:bg-white/20 text-white border-none">
              View Plans
            </Button>
          </div>
        </div>
      </div>

      {/* Recent Links Table */}
      <div className="bg-card border border-border rounded-2xl overflow-hidden">
        <div className="p-6 border-b border-border flex items-center justify-between">
          <h3 className="font-display font-bold text-lg">Recent Links</h3>
          <Link href="/links" className="text-sm text-primary hover:text-primary/80 font-medium">
            View All
          </Link>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-muted/30 text-xs uppercase text-muted-foreground font-semibold">
              <tr>
                <th className="px-6 py-4">Short Link</th>
                <th className="px-6 py-4">Original URL</th>
                <th className="px-6 py-4 text-center">Clicks</th>
                <th className="px-6 py-4 text-right">Created</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {isLoading ? (
                Array(3).fill(0).map((_, i) => (
                  <tr key={i}>
                    <td className="px-6 py-4"><Skeleton className="h-6 w-32" /></td>
                    <td className="px-6 py-4"><Skeleton className="h-6 w-48" /></td>
                    <td className="px-6 py-4"><Skeleton className="h-6 w-12 mx-auto" /></td>
                    <td className="px-6 py-4"><Skeleton className="h-6 w-24 ml-auto" /></td>
                    <td className="px-6 py-4"><Skeleton className="h-8 w-20 ml-auto" /></td>
                  </tr>
                ))
              ) : links?.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-muted-foreground">
                    No links yet. Create your first one above!
                  </td>
                </tr>
              ) : (
                links?.slice(0, 5).map((link) => (
                  <tr key={link.id} className="hover:bg-muted/20 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-primary">/{link.alias}</span>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-6 w-6 text-muted-foreground hover:text-foreground"
                          onClick={() => copyToClipboard(link.alias)}
                        >
                          <Copy className="w-3 h-3" />
                        </Button>
                      </div>
                    </td>
                    <td className="px-6 py-4 max-w-xs">
                      <div className="truncate text-sm text-muted-foreground" title={link.originalUrl}>
                        {link.originalUrl}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center font-semibold text-foreground">
                      {link.clicks.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 text-right text-sm text-muted-foreground">
                      {new Date(link.createdAt!).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link href={`/links/${link.alias}`}>
                          <Button variant="outline" size="sm" className="h-8 gap-2">
                            <BarChart3 className="w-3 h-3" /> Analytics
                          </Button>
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// Helper icon
function PlusCircleIcon({ className }: { className?: string }) {
  return (
    <svg 
      className={className} 
      xmlns="http://www.w3.org/2000/svg" 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="10" />
      <path d="M12 8v8" />
      <path d="M8 12h8" />
    </svg>
  );
}
