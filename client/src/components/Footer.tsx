import { Mail, Phone } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t border-border bg-card mt-12">
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-8">
        <div className="flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="text-sm text-muted-foreground">
            <p>URL Shortener © 2025</p>
          </div>
          <div className="flex flex-col md:flex-row gap-6">
            <a 
              href="mailto:yelamabhargav@gmail.com"
              className="flex items-center gap-2 text-sm hover:text-foreground transition-colors"
              data-testid="link-email"
            >
              <Mail className="w-4 h-4" />
              <span>yelamabhargav@gmail.com</span>
            </a>
            <a 
              href="tel:+919963912613"
              className="flex items-center gap-2 text-sm hover:text-foreground transition-colors"
              data-testid="link-phone"
            >
              <Phone className="w-4 h-4" />
              <span>+91 9963912613</span>
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
