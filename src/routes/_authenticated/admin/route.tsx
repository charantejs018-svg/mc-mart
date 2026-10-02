import { createFileRoute, Link, Outlet, redirect, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { LayoutDashboard, Package, PlusSquare, Tags, ShoppingBag, Users, Settings, LogOut, Menu, X, Store } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { fetchIsAdmin } from "@/lib/auth";

export const Route = createFileRoute("/_authenticated/admin")({
  ssr: false,
  beforeLoad: async ({ context }) => {
    const ok = await fetchIsAdmin((context as { user: { id: string } }).user.id);
    if (!ok) throw redirect({ to: "/access-denied" });
  },
  component: AdminLayout,
});

const NAV = [
  { to: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { to: "/admin/products", label: "Products", icon: Package, exact: true },
  { to: "/admin/products/add", label: "Add Product", icon: PlusSquare, exact: true },
  { to: "/admin/categories", label: "Categories", icon: Tags, exact: false },
  { to: "/admin/orders", label: "Orders", icon: ShoppingBag, exact: false },
  { to: "/admin/users", label: "Users", icon: Users, exact: false },
  { to: "/admin/settings", label: "Settings", icon: Settings, exact: false },
] as const;

function AdminLayout() {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const qc = useQueryClient();
  const logout = async () => {
    await qc.cancelQueries();
    qc.clear();
    await supabase.auth.signOut();
    navigate({ to: "/admin-login", replace: true });
  };

  const nav = (
    <nav className="flex flex-1 flex-col gap-1 p-3">
      {NAV.map(({ to, label, icon: Icon, exact }) => (
        <Link
          key={to}
          to={to}
          onClick={() => setOpen(false)}
          activeOptions={{ exact }}
          className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-sidebar-foreground/80 transition hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
          activeProps={{ className: "!bg-sidebar-primary !text-sidebar-primary-foreground" }}
        >
          <Icon className="h-4 w-4" /> {label}
        </Link>
      ))}
      <div className="mt-auto space-y-1 border-t border-sidebar-border pt-3">
        <Link to="/" className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-sidebar-foreground/80 hover:bg-sidebar-accent"><Store className="h-4 w-4" /> View store</Link>
        <button onClick={logout} className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-sidebar-foreground/80 hover:bg-sidebar-accent"><LogOut className="h-4 w-4" /> Logout</button>
      </div>
    </nav>
  );

  const brand = <div className="px-6 py-5 font-display text-xl font-bold text-sidebar-accent-foreground">ShopKart <span className="text-sidebar-primary">Admin</span></div>;

  return (
    <div className="admin-theme min-h-screen bg-background">
      <aside className="fixed inset-y-0 left-0 hidden w-64 flex-col bg-sidebar lg:flex">{brand}{nav}</aside>
      <header className="sticky top-0 z-30 flex items-center justify-between bg-sidebar px-4 py-3 lg:hidden">
        <span className="font-display font-bold text-sidebar-accent-foreground">ShopKart <span className="text-sidebar-primary">Admin</span></span>
        <button onClick={() => setOpen(true)} className="text-sidebar-foreground" aria-label="Open menu"><Menu className="h-6 w-6" /></button>
      </header>
      {open && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-foreground/50" onClick={() => setOpen(false)} />
          <aside className="relative flex h-full w-64 flex-col bg-sidebar">
            <button onClick={() => setOpen(false)} className="absolute right-3 top-4 text-sidebar-foreground" aria-label="Close menu"><X className="h-5 w-5" /></button>
            {brand}{nav}
          </aside>
        </div>
      )}
      <main className="p-4 sm:p-8 lg:ml-64"><Outlet /></main>
    </div>
  );
}
