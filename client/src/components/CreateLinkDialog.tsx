import { useState } from "react";
import { useCreateLink } from "@/hooks/use-links";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Wand2, Link as LinkIcon, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export function CreateLinkDialog() {
  const [open, setOpen] = useState(false);
  const [originalUrl, setOriginalUrl] = useState("");
  const [alias, setAlias] = useState("");
  
  const createLink = useCreateLink();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Auto-prepend https:// if missing
    let formattedUrl = originalUrl;
    if (!/^https?:\/\//i.test(formattedUrl)) {
      formattedUrl = 'https://' + formattedUrl;
    }

    try {
      await createLink.mutateAsync({
        originalUrl: formattedUrl,
        alias: alias || undefined, // Send undefined to let backend generate random alias
      });
      
      toast({
        title: "Link Created!",
        description: "Your new short link is ready to share.",
      });
      setOpen(false);
      setOriginalUrl("");
      setAlias("");
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to create link",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2 bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/25">
          <Plus className="w-4 h-4" /> Create Link
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] bg-card border-border">
        <DialogHeader>
          <DialogTitle className="text-xl font-display">Create Short Link</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-6 mt-4">
          <div className="space-y-2">
            <Label htmlFor="url">Destination URL</Label>
            <div className="relative">
              <LinkIcon className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                id="url"
                placeholder="https://example.com/long-url"
                className="pl-9 bg-background/50 border-border focus:border-primary"
                value={originalUrl}
                onChange={(e) => setOriginalUrl(e.target.value)}
                required
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="alias">
              Custom Alias <span className="text-muted-foreground font-normal">(Optional)</span>
            </Label>
            <div className="relative">
              <Wand2 className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                id="alias"
                placeholder="my-custom-link"
                className="pl-9 bg-background/50 border-border focus:border-primary"
                value={alias}
                onChange={(e) => setAlias(e.target.value)}
              />
            </div>
            <p className="text-xs text-muted-foreground">
              Leave empty to auto-generate a random alias.
            </p>
          </div>

          <Button 
            type="submit" 
            className="w-full bg-primary hover:bg-primary/90"
            disabled={createLink.isPending}
          >
            {createLink.isPending ? "Creating..." : "Create Short Link"}
          </Button>

          {createLink.isError && (
            <div className="flex items-center gap-2 text-sm text-destructive bg-destructive/10 p-3 rounded-lg">
              <AlertCircle className="w-4 h-4" />
              {createLink.error.message}
            </div>
          )}
        </form>
      </DialogContent>
    </Dialog>
  );
}
