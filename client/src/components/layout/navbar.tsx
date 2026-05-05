import { Link, useLocation } from "wouter";
import { Sprout, Video, ShoppingBag, Brain, Upload, User, Menu, CalendarDays, LogIn, Crown, ShieldCheck, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useState } from "react";
import { cn } from "@/lib/utils";
import ThemeToggle from "@/components/ui-custom/theme-toggle";
import { useCart } from "@/lib/cart";
import { persistSelectedRole } from "@/lib/auth-preferences";
import { useFirebaseAuth } from "@/lib/firebase-auth";

export default function Navbar() {
  const [location] = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const { itemCount } = useCart();
  const { user, isAdmin, loading, loginWithGoogle, logout } = useFirebaseAuth();

  const navItems = [
    { href: "/", label: "Home", icon: Sprout },
    { href: "/tutorials", label: "Tutorials", icon: Video },
    { href: "/advisor", label: "AI Advisor", icon: Brain },
    { href: "/kits", label: "Shop Kits", icon: ShoppingBag },
    { href: "/farm-plan", label: "Farm Planner", icon: CalendarDays },
    { href: "/creator", label: "Creator", icon: User },
    ...(isAdmin ? [{ href: "/admin", label: "Admin", icon: ShieldCheck }] : []),
    { href: "/about", label: "About", icon: Sprout },
  ];

  return (
    <nav className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur-md supports-[backdrop-filter]:bg-background/60 transition-colors duration-300">
      <div className="container flex h-16 items-center justify-between px-4 md:px-6">
        <Link href="/" className="flex items-center gap-2 font-serif text-xl font-bold text-primary hover:opacity-90 transition-opacity">
          <Sprout className="h-6 w-6" />
          <span>Farmora</span>
        </Link>

        <div className="hidden md:flex items-center gap-6">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-2 text-sm font-medium transition-colors hover:text-primary",
                location === item.href ? "text-primary font-semibold" : "text-muted-foreground"
              )}
            >
              {item.label}
            </Link>
          ))}
        </div>

        <div className="hidden md:flex items-center gap-3">
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="gap-2 rounded-full">
                  {user.photoUrl ? <img src={user.photoUrl} alt="" className="h-5 w-5 rounded-full" /> : <User className="h-4 w-4" />}
                  {user.name || user.email}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 rounded-2xl p-2">
                <DropdownMenuLabel>{user.role === "admin" ? "Admin account" : "Farmora account"}</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {isAdmin && (
                  <Link href="/admin">
                    <DropdownMenuItem className="rounded-xl">
                      <ShieldCheck className="h-4 w-4" />
                      Admin Dashboard
                    </DropdownMenuItem>
                  </Link>
                )}
                <DropdownMenuItem className="rounded-xl" onClick={logout}>
                  <LogOut className="h-4 w-4" />
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="gap-2 rounded-full" disabled={loading}>
                  <LogIn className="h-4 w-4" />
                  Login
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 rounded-2xl p-2">
                <DropdownMenuLabel>Continue with Farmora</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="rounded-xl" onClick={loginWithGoogle}>
                  <LogIn className="h-4 w-4" />
                  Google Gmail Login
                </DropdownMenuItem>
                <Link href="/login/user" onClick={() => persistSelectedRole("user")}>
                  <DropdownMenuItem className="rounded-xl">
                    <User className="h-4 w-4" />
                    User Login
                  </DropdownMenuItem>
                </Link>
                <Link href="/login/creator" onClick={() => persistSelectedRole("creator")}>
                  <DropdownMenuItem className="rounded-xl">
                    <Crown className="h-4 w-4" />
                    Creator Login
                  </DropdownMenuItem>
                </Link>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
          <Link href="/cart">
            <Button variant="outline" size="sm" className="rounded-full">
              Cart ({itemCount})
            </Button>
          </Link>
          <ThemeToggle />
          <Link href="/login">
            <Button variant="default" size="sm" className="gap-2 bg-primary hover:bg-primary/90 text-white rounded-full">
              <Sprout className="h-4 w-4" />
              Get Started
            </Button>
          </Link>
          <Link href="/upload">
            <Button variant="default" size="sm" className="gap-2 bg-primary hover:bg-primary/90 text-white rounded-full">
              <Upload className="h-4 w-4" />
              Upload
            </Button>
          </Link>
        </div>

        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetTrigger asChild className="md:hidden">
            <Button variant="ghost" size="icon">
              <Menu className="h-6 w-6" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-[300px] sm:w-[400px]">
            <div className="flex flex-col gap-6 py-6">
              <Link href="/" className="flex items-center gap-2 font-serif text-xl font-bold text-primary" onClick={() => setIsOpen(false)}>
                <Sprout className="h-6 w-6" />
                <span>Farmora</span>
              </Link>
              <div className="flex flex-col gap-4">
                {navItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setIsOpen(false)}
                    className={cn(
                      "flex items-center gap-3 px-4 py-2 rounded-md transition-colors",
                      location === item.href ? "bg-primary/10 text-primary font-semibold" : "text-muted-foreground hover:bg-muted"
                    )}
                  >
                    <item.icon className="h-5 w-5" />
                    {item.label}
                  </Link>
                ))}
                <div className="h-px bg-border my-2" />
                <Link href="/cart" onClick={() => setIsOpen(false)} className="px-4">
                  <Button variant="outline" className="w-full rounded-full">
                    Cart ({itemCount})
                  </Button>
                </Link>
                <div className="grid grid-cols-2 gap-2 px-4">
                  <Button variant="outline" className="col-span-2 w-full rounded-full gap-2" onClick={() => { loginWithGoogle(); setIsOpen(false); }}>
                    <LogIn className="h-4 w-4" />
                    Google Gmail Login
                  </Button>
                  <Link href="/login/user" onClick={() => { persistSelectedRole("user"); setIsOpen(false); }}>
                    <Button variant="outline" className="w-full rounded-full gap-2">
                      <User className="h-4 w-4" />
                      User Login
                    </Button>
                  </Link>
                  <Link href="/login/creator" onClick={() => { persistSelectedRole("creator"); setIsOpen(false); }}>
                    <Button variant="outline" className="w-full rounded-full gap-2">
                      <Crown className="h-4 w-4" />
                      Creator
                    </Button>
                  </Link>
                </div>
                <Link href="/login" onClick={() => setIsOpen(false)} className="px-4">
                  <Button className="w-full gap-2 rounded-full">
                    <Sprout className="h-4 w-4" />
                    Get Started
                  </Button>
                </Link>
                <div className="flex items-center justify-between px-4">
                  <span className="text-sm text-muted-foreground">Dark mode</span>
                  <ThemeToggle />
                </div>
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
