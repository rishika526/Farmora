import { Link, useLocation } from "wouter";
import { Sprout, Video, ShoppingBag, Brain, Upload, User, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useState } from "react";
import { cn } from "@/lib/utils";

export default function Navbar() {
  const [location] = useLocation();
  const [isOpen, setIsOpen] = useState(false);

  const navItems = [
    { href: "/", label: "Home", icon: Sprout },
    { href: "/tutorials", label: "Tutorials", icon: Video },
    { href: "/advisor", label: "AI Advisor", icon: Brain },
    { href: "/kits", label: "Shop Kits", icon: ShoppingBag },
    { href: "/creator", label: "Creator", icon: User },
    { href: "/about", label: "About", icon: Sprout },
  ];

  return (
    <nav className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur-md supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between px-4 md:px-6">
        <Link href="/">
          <a className="flex items-center gap-2 font-serif text-xl font-bold text-primary hover:opacity-90 transition-opacity">
            <Sprout className="h-6 w-6" />
            <span>Farmora</span>
          </a>
        </Link>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-6">
          {navItems.map((item) => (
            <Link key={item.href} href={item.href}>
              <a
                className={cn(
                  "flex items-center gap-2 text-sm font-medium transition-colors hover:text-primary",
                  location === item.href
                    ? "text-primary font-semibold"
                    : "text-muted-foreground"
                )}
              >
                {item.label}
              </a>
            </Link>
          ))}
        </div>

        <div className="hidden md:flex items-center gap-4">
          <Link href="/upload">
            <Button variant="default" size="sm" className="gap-2 bg-primary hover:bg-primary/90 text-white rounded-full">
              <Upload className="h-4 w-4" />
              Upload
            </Button>
          </Link>
        </div>

        {/* Mobile Nav */}
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetTrigger asChild className="md:hidden">
            <Button variant="ghost" size="icon">
              <Menu className="h-6 w-6" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-[300px] sm:w-[400px]">
            <div className="flex flex-col gap-6 py-6">
              <Link href="/">
                <a className="flex items-center gap-2 font-serif text-xl font-bold text-primary" onClick={() => setIsOpen(false)}>
                  <Sprout className="h-6 w-6" />
                  <span>Farmora</span>
                </a>
              </Link>
              <div className="flex flex-col gap-4">
                {navItems.map((item) => (
                  <Link key={item.href} href={item.href}>
                    <a
                      onClick={() => setIsOpen(false)}
                      className={cn(
                        "flex items-center gap-3 px-4 py-2 rounded-md transition-colors",
                        location === item.href
                          ? "bg-primary/10 text-primary font-semibold"
                          : "text-muted-foreground hover:bg-muted"
                      )}
                    >
                      <item.icon className="h-5 w-5" />
                      {item.label}
                    </a>
                  </Link>
                ))}
                <div className="h-px bg-border my-2" />
                <Link href="/upload">
                  <Button className="w-full gap-2 rounded-full" onClick={() => setIsOpen(false)}>
                    <Upload className="h-4 w-4" />
                    Upload Tutorial
                  </Button>
                </Link>
              </div>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </nav>
  );
}
