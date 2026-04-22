import { Sprout, Twitter, Instagram, Facebook } from "lucide-react";
import { Link } from "wouter";

export default function Footer() {
  return (
    <footer className="bg-[#fcfbf7] border-t border-border/50 py-16">
      <div className="container px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
          <div className="space-y-6">
            <Link href="/" className="flex items-center gap-2 font-bold text-2xl text-primary">
              <Sprout className="h-8 w-8" />
              <span>Farmora</span>
            </Link>
            <p className="text-muted-foreground leading-relaxed max-w-xs">
              Empowering growers with AI-driven organic farming wisdom. From soil to solution, we make sustainability practical.
            </p>
          </div>

          <div className="space-y-6">
            <h4 className="font-bold text-lg">Platform</h4>
            <ul className="space-y-4 text-muted-foreground">
              <li><Link href="/tutorials" className="hover:text-primary transition-colors">Tutorials</Link></li>
              <li><Link href="/advisor" className="hover:text-primary transition-colors">AI Advisor</Link></li>
              <li><Link href="/kits" className="hover:text-primary transition-colors">Marketplace</Link></li>
              <li><Link href="/farm-plan" className="hover:text-primary transition-colors">Farm Planner</Link></li>
              <li><Link href="/upload" className="hover:text-primary transition-colors">Upload</Link></li>
            </ul>
          </div>

          <div className="space-y-6">
            <h4 className="font-bold text-lg">Resources</h4>
            <ul className="space-y-4 text-muted-foreground">
              <li><Link href="/about" className="hover:text-primary transition-colors">About Us</Link></li>
              <li><Link href="/community-guidelines" className="hover:text-primary transition-colors">Community Guidelines</Link></li>
              <li><Link href="/privacy-policy" className="hover:text-primary transition-colors">Privacy Policy</Link></li>
              <li><Link href="/terms-of-service" className="hover:text-primary transition-colors">Terms of Service</Link></li>
            </ul>
          </div>

          <div className="space-y-6">
            <h4 className="font-bold text-lg">Connect</h4>
            <div className="flex gap-4">
              <a href="#" className="h-10 w-10 rounded-full border border-border flex items-center justify-center hover:bg-primary hover:text-white transition-all">
                <Twitter className="h-5 w-5" />
              </a>
              <a href="#" className="h-10 w-10 rounded-full border border-border flex items-center justify-center hover:bg-primary hover:text-white transition-all">
                <Instagram className="h-5 w-5" />
              </a>
              <a href="#" className="h-10 w-10 rounded-full border border-border flex items-center justify-center hover:bg-primary hover:text-white transition-all">
                <Facebook className="h-5 w-5" />
              </a>
            </div>
          </div>
        </div>

        <div className="mt-16 pt-8 border-t border-border/30 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-muted-foreground">
          <p>© 2026 Farmora Inc. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
