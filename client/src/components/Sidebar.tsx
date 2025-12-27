import { Link, useLocation } from "wouter";
import { LayoutDashboard, Link2, Settings, BarChart3, PlusCircle } from "lucide-react";
import { cn } from "@/lib/utils";

export function Sidebar() {
  const [location] = useLocation();

  const navItems = [
    { icon: LayoutDashboard, label: "Dashboard", href: "/" },
    { icon: Link2, label: "My Links", href: "/links" },
    // { icon: BarChart3, label: "Analytics", href: "/analytics" },
    // { icon: Settings, label: "Settings", href: "/settings" },
  ];

  return (
    <div className="w-64 h-screen bg-card border-r border-border hidden md:flex flex-col fixed left-0 top-0 z-50">
      <div className="p-6">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-lg shadow-primary/20">
            <Link2 className="w-5 h-5 text-white" />
          </div>
          <h1 className="text-xl font-display font-bold text-white tracking-tight">
            Short<span className="text-primary">ly</span>
          </h1>
        </div>

        <nav className="space-y-2">
          {navItems.map((item) => {
            const isActive = location === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group",
                  isActive
                    ? "bg-primary/10 text-primary font-semibold"
                    : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                )}
              >
                <item.icon
                  className={cn(
                    "w-5 h-5 transition-colors",
                    isActive ? "text-primary" : "text-muted-foreground group-hover:text-foreground"
                  )}
                />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="mt-auto p-6 border-t border-border/50">
        <div className="bg-gradient-to-br from-primary/20 to-accent/20 rounded-2xl p-4 border border-white/5">
          <h3 className="font-semibold text-foreground mb-1">Pro Plan</h3>
          <p className="text-xs text-muted-foreground mb-3">Get advanced analytics & custom domains</p>
          <button className="w-full py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors">
            Upgrade
          </button>
        </div>
      </div>
    </div>
  );
}
