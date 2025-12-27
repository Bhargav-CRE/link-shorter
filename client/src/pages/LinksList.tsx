import { useLinks } from "@/hooks/use-links";
import { CreateLinkDialog } from "@/components/CreateLinkDialog";
import { Link } from "wouter";
import { Copy, BarChart3, Search, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";

export default function LinksList() {
  const { data: links, isLoading } = useLinks();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");

  const copyToClipboard = (alias: string) => {
    const url = `${window.location.protocol}//${window.location.host}/r/${alias}`;
    navigator.clipboard.writeText(url);
    toast({
      title: "Copied!",
      description: "Short link copied to clipboard",
    });
  };

  const filteredLinks = links?.filter(link => 
    link.alias.toLowerCase().includes(searchTerm.toLowerCase()) || 
    link.originalUrl.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold text-foreground">My Links</h1>
          <p className="text-muted-foreground mt-1">Manage and track all your shortened URLs</p>
        </div>
        <CreateLinkDialog />
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Search by alias or URL..." 
            className="pl-9 bg-card border-border"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Button variant="outline" className="gap-2 bg-card border-border">
          <Filter className="w-4 h-4" /> Filter
        </Button>
      </div>

      {/* Links Grid */}
      <div className="grid grid-cols-1 gap-4">
        {isLoading ? (
          Array(5).fill(0).map((_, i) => (
            <div key={i} className="bg-card border border-border p-6 rounded-xl flex items-center gap-4">
              <Skeleton className="h-12 w-12 rounded-lg" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-5 w-32" />
                <Skeleton className="h-4 w-64" />
              </div>
            </div>
          ))
        ) : filteredLinks?.length === 0 ? (
          <div className="text-center py-20 bg-card border border-border rounded-xl">
            <p className="text-muted-foreground">No links found matching your search.</p>
          </div>
        ) : (
          filteredLinks?.map((link) => (
            <div 
              key={link.id} 
              className="bg-card border border-border p-6 rounded-xl flex flex-col sm:flex-row sm:items-center gap-6 hover:border-primary/50 transition-colors group"
            >
              {/* Icon/QR Placeholder */}
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                <span className="font-bold text-lg">/</span>
              </div>

              {/* Main Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 mb-1">
                  <span className="font-display font-bold text-lg text-primary">/{link.alias}</span>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-6 w-6 text-muted-foreground hover:text-foreground"
                    onClick={() => copyToClipboard(link.alias)}
                  >
                    <Copy className="w-3 h-3" />
                  </Button>
                </div>
                <p className="text-sm text-muted-foreground truncate" title={link.originalUrl}>
                  {link.originalUrl}
                </p>
                <div className="flex items-center gap-4 mt-3 text-xs text-muted-foreground">
                  <span>{new Date(link.createdAt!).toLocaleDateString()}</span>
                  <span>•</span>
                  <span className="text-foreground font-medium">{link.clicks.toLocaleString()} clicks</span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-3 pt-4 sm:pt-0 border-t sm:border-t-0 border-border">
                <Link href={`/links/${link.alias}`}>
                  <Button variant="secondary" className="gap-2">
                    <BarChart3 className="w-4 h-4" /> Analytics
                  </Button>
                </Link>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
