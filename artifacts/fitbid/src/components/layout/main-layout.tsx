import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@workspace/replit-auth-web";
import { User, LogOut, Menu, X, Bell } from "lucide-react";
import { Button } from "@/components/ui/button";

export function MainLayout({ children }: { children: React.ReactNode }) {
  const { user, logout } = useAuth();
  const [location] = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location]);

  const navLinks = [
    { href: "/dashboard", label: "Dashboard" },
    { href: "/posts", label: "Opportunities" },
    { href: "/engagements", label: "My Work" },
    { href: "/directory", label: "Directory" },
  ];

  return (
    <div className="min-h-[100dvh] flex flex-col bg-background">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <Link href="/" className="flex items-center gap-2">
              <span className="text-xl font-bold tracking-tight text-primary">FitBid</span>
            </Link>
            
            <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`transition-colors hover:text-primary ${
                    location.startsWith(link.href) ? "text-primary" : "text-muted-foreground"
                  }`}
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>

          <div className="flex items-center gap-4">
            {user ? (
              <>
                <Link href="/settings">
                  <Button variant="ghost" size="icon" className="relative">
                    <Bell className="h-5 w-5" />
                  </Button>
                </Link>
                <div className="hidden md:flex items-center gap-4">
                  <div className="flex flex-col text-right">
                    <span className="text-sm font-medium leading-none">{user.name || "User"}</span>
                    <span className="text-xs text-muted-foreground">{user.role}</span>
                  </div>
                  <Button variant="outline" size="sm" onClick={() => logout()}>
                    <LogOut className="h-4 w-4 mr-2" />
                    Logout
                  </Button>
                </div>
              </>
            ) : (
              <div className="hidden md:flex items-center gap-4">
                <Link href="/login">
                  <Button variant="ghost">Log in</Button>
                </Link>
                <Link href="/login">
                  <Button>Sign up</Button>
                </Link>
              </div>
            )}

            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </Button>
          </div>
        </div>
      </header>

      {mobileMenuOpen && (
        <div className="fixed inset-0 top-16 z-40 bg-background md:hidden border-b">
          <nav className="container px-4 py-6 flex flex-col gap-4">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`text-lg font-medium p-2 rounded-md ${
                  location.startsWith(link.href) ? "bg-primary/10 text-primary" : "text-foreground"
                }`}
              >
                {link.label}
              </Link>
            ))}
            {!user && (
              <div className="flex flex-col gap-2 mt-4 pt-4 border-t">
                <Link href="/login">
                  <Button variant="outline" className="w-full justify-start">Log in</Button>
                </Link>
                <Link href="/login">
                  <Button className="w-full justify-start">Sign up</Button>
                </Link>
              </div>
            )}
            {user && (
              <div className="flex flex-col gap-2 mt-4 pt-4 border-t">
                <Button variant="outline" className="w-full justify-start text-destructive" onClick={() => logout()}>
                  <LogOut className="h-4 w-4 mr-2" />
                  Logout
                </Button>
              </div>
            )}
          </nav>
        </div>
      )}

      <main className="flex-1 flex flex-col relative">
        {children}
      </main>
    </div>
  );
}