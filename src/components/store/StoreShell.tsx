import { Link, useNavigate } from "@tanstack/react-router";
import { useState, type ReactNode, type FormEvent } from "react";
import { ShoppingCart, Search, User, LogOut, Package, LayoutDashboard, Menu } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { useCart, useCategories } from "@/lib/shop";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";

export function StoreShell({ children }: { children: ReactNode }) {
  const { user, isAdmin } = useAuth();
  const { data: cart } = useCart(user?.id);
  const { data: categories } = useCategories();
  const count = cart?.reduce((s, c) => s + c.quantity, 0) ?? 0;
  const [q, setQ] = useState("");
  const navigate = useNavigate();
  const qc = useQueryClient();

  const onSearch = (e: FormEvent) => {
    e.preventDefault();
    navigate({ to: "/products", search: { q: q.trim() || undefined } });
  };

  const signOut = async () => {
    await qc.cancelQueries();
    qc.clear();
    await supabase.auth.signOut();
    navigate({ to: "/auth", replace: true });
  };

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-40 border-b bg-background/90 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center gap-4 px-4 py-3">
          <Link to="/" className="font-display text-2xl font-extrabold tracking-tight">
            Shop<span className="text-primary">Kart</span>
          </Link>
          <form onSubmit={onSearch} className="relative hidden flex-1 md:block">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search phones, laptops, shoes…"
              className="w-full rounded-full border bg-card py-2.5 pl-10 pr-4 text-sm outline-none focus:ring-2 focus:ring-ring"
            />
          </form>
          <nav className="ml-auto flex items-center gap-1">
            <Link to="/products" className="hidden rounded-full px-3 py-2 text-sm font-semibold hover:bg-muted sm:block">
              Shop
            </Link>
            <Link to="/cart" className="relative rounded-full p-2.5 hover:bg-muted" aria-label="Cart">
              <ShoppingCart className="h-5 w-5" />
              {count > 0 && (
                <span className="absolute -right-0.5 -top-0.5 grid h-5 min-w-5 place-items-center rounded-full bg-primary px-1 text-[10px] font-bold text-primary-foreground">
                  {count}
                </span>
              )}
            </Link>
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="rounded-full p-2.5 hover:bg-muted" aria-label="Account">
                    <User className="h-5 w-5" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel className="truncate">{user.email}</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link to="/profile"><User className="mr-2 h-4 w-4" />Profile</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/orders"><Package className="mr-2 h-4 w-4" />My Orders</Link>
                  </DropdownMenuItem>
                  {isAdmin && (
                    <DropdownMenuItem asChild>
                      <Link to="/admin"><LayoutDashboard className="mr-2 h-4 w-4" />Admin Panel</Link>
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={signOut}><LogOut className="mr-2 h-4 w-4" />Logout</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button asChild size="sm" className="rounded-full">
                <Link to="/auth">Login</Link>
              </Button>
            )}
          </nav>
        </div>
        <div className="border-t">
          <div className="mx-auto flex max-w-7xl items-center gap-1 overflow-x-auto px-4 py-2 text-sm">
            <Menu className="mr-1 h-4 w-4 shrink-0 text-muted-foreground" />
            {categories?.map((c) => (
              <Link
                key={c.id}
                to="/products"
                search={{ category: c.id }}
                className="shrink-0 rounded-full px-3 py-1 font-medium text-muted-foreground transition hover:bg-accent hover:text-accent-foreground"
              >
                {c.name}
              </Link>
            ))}
          </div>
          <form onSubmit={onSearch} className="px-4 pb-3 md:hidden">
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search products…"
              className="w-full rounded-full border bg-card px-4 py-2 text-sm outline-none"
            />
          </form>
        </div>
      </header>
      <main className="flex-1">{children}</main>
      <footer className="mt-16 bg-secondary text-secondary-foreground">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 py-12 sm:grid-cols-3">
          <div>
            <p className="font-display text-2xl font-extrabold">Shop<span className="text-primary">Kart</span></p>
            <p className="mt-2 text-sm opacity-70">Everyday tech, fashion and gear — delivered fast.</p>
          </div>
          <div className="text-sm">
            <p className="font-semibold">Shop</p>
            <ul className="mt-2 space-y-1 opacity-70">
              <li><Link to="/products">All products</Link></li>
              <li><Link to="/cart">Cart</Link></li>
              <li><Link to="/orders">Track orders</Link></li>
            </ul>
          </div>
          <div className="text-sm">
            <p className="font-semibold">Promise</p>
            <ul className="mt-2 space-y-1 opacity-70">
              <li>Free delivery over ₹999</li>
              <li>Cash on Delivery available</li>
              <li>7-day easy returns</li>
            </ul>
          </div>
        </div>
        <p className="border-t border-white/10 py-4 text-center text-xs opacity-60">© {new Date().getFullYear()} ShopKart</p>
      </footer>
    </div>
  );
}
