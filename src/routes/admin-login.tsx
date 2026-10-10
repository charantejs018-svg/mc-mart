import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { ArrowLeft, ShieldCheck, Truck, PackageCheck, Lock } from "lucide-react";
import { toast } from "sonner";
import { AuthForm } from "@/components/AuthForm";
import { supabase } from "@/integrations/supabase/client";
import loginBanner from "@/assets/login-banner.jpg";

export const Route = createFileRoute("/admin-login")({
  head: () => ({
    meta: [
      { title: "Admin Login — ShopKart" },
      { name: "description", content: "Sign in to the ShopKart admin panel." },
      { property: "og:title", content: "Admin Login — ShopKart" },
      { property: "og:description", content: "ShopKart admin panel sign in." },
    ],
  }),
  component: AdminLogin,
});

function AdminLogin() {
  const navigate = useNavigate();

  return (
    <div className="admin-theme min-h-screen bg-muted/30">
      <div className="grid min-h-screen lg:grid-cols-12">
        {/* Visual Showcase Panel (Desktop) */}
        <div className="relative hidden lg:col-span-6 xl:col-span-7 lg:flex flex-col justify-between overflow-hidden bg-gradient-to-br from-[#fff3ea] via-[#fcdbbd] to-[#ebb980] p-10 xl:p-14">
          {/* Subtle decorative background blur spots */}
          <div className="pointer-events-none absolute -top-24 -left-24 h-96 w-96 rounded-full bg-white/40 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-24 -right-24 h-96 w-96 rounded-full bg-orange-400/20 blur-3xl" />

          {/* Top Brand Header */}
          <div className="relative z-10 flex items-center justify-between">
            <Link to="/" className="group flex items-center gap-2.5">
              <span className="font-display text-3xl font-extrabold tracking-tight text-neutral-900">
                Shop<span className="text-primary">Kart</span>
              </span>
              <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-semibold text-primary">
                Admin Console
              </span>
            </Link>
            <div className="flex items-center gap-1.5 rounded-full bg-white/80 px-3 py-1 text-xs font-medium text-neutral-700 shadow-xs backdrop-blur-sm">
              <ShieldCheck className="h-3.5 w-3.5 text-primary" />
              Restricted Operations
            </div>
          </div>

          {/* Centerpiece Image Showcase */}
          <div className="relative z-10 my-auto py-8">
            <div className="group relative mx-auto max-w-xl overflow-hidden rounded-3xl border border-white/80 bg-white/30 p-2.5 shadow-2xl shadow-orange-950/15 backdrop-blur-sm transition-all duration-300 hover:shadow-orange-950/25">
              <div className="overflow-hidden rounded-2xl bg-[#ebb980]">
                <img
                  src={loginBanner}
                  alt="ShopKart store management and logistics"
                  className="h-auto w-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                />
              </div>
              <div className="mt-3 px-3 pb-2 text-center">
                <p className="text-base font-bold text-neutral-900">
                  Store Operations & Logistics Control Center
                </p>
                <p className="mt-0.5 text-xs text-neutral-700">
                  Real-time inventory tracking • Instant dispatch fulfillment • Analytics overview
                </p>
              </div>
            </div>

            {/* Feature Pills */}
            <div className="mt-8 grid grid-cols-3 gap-3 max-w-xl mx-auto">
              <div className="flex items-center gap-2.5 rounded-xl border border-white/60 bg-white/70 p-3 shadow-xs backdrop-blur-sm">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <Truck className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-xs font-bold text-neutral-900">Dispatch</p>
                  <p className="text-[11px] text-neutral-600">Live fleet routing</p>
                </div>
              </div>

              <div className="flex items-center gap-2.5 rounded-xl border border-white/60 bg-white/70 p-3 shadow-xs backdrop-blur-sm">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <PackageCheck className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-xs font-bold text-neutral-900">Inventory</p>
                  <p className="text-[11px] text-neutral-600">Stock & catalog</p>
                </div>
              </div>

              <div className="flex items-center gap-2.5 rounded-xl border border-white/60 bg-white/70 p-3 shadow-xs backdrop-blur-sm">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <Lock className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-xs font-bold text-neutral-900">Security</p>
                  <p className="text-[11px] text-neutral-600">Role-based access</p>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Trust Note */}
          <div className="relative z-10 flex items-center justify-between text-xs text-neutral-600">
            <span>ShopKart Internal Management System</span>
            <span className="flex items-center gap-1">
              <ShieldCheck className="h-3.5 w-3.5 text-primary" /> Authenticated Staff Only
            </span>
          </div>
        </div>

        {/* Right / Login Form Column */}
        <div className="flex flex-col justify-between px-6 py-8 sm:px-10 lg:col-span-6 xl:col-span-5 lg:px-12 xl:px-16 bg-card/60 backdrop-blur-xs">
          {/* Top navigation back to store */}
          <div className="flex items-center justify-between">
            <Link
              to="/"
              className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Back to store</span>
            </Link>

            <div className="flex items-center gap-1.5 font-display text-xl font-bold lg:hidden text-foreground">
              <ShieldCheck className="h-5 w-5 text-primary" />
              <span>Admin Panel</span>
            </div>
          </div>

          {/* Form wrapper */}
          <div className="mx-auto w-full max-w-md py-6 sm:py-8">
            {/* Mobile / Tablet banner */}
            <div className="mb-6 lg:hidden overflow-hidden rounded-2xl border border-orange-200/70 bg-[#ebb980] shadow-sm">
              <img
                src={loginBanner}
                alt="ShopKart quick delivery"
                className="h-36 sm:h-44 w-full object-cover"
              />
              <div className="bg-gradient-to-r from-orange-50 to-amber-50 px-3.5 py-2 text-center text-xs font-semibold text-neutral-800">
                🔒 ShopKart Administrator & Logistics Console
              </div>
            </div>

            <div className="mb-4 flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-lg font-bold leading-none text-foreground">Admin Portal</h2>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Sign in with your authorized admin credentials
                </p>
              </div>
            </div>

            {import.meta.env.DEV && import.meta.env.VITE_ADMIN_EMAIL && (
              <div className="mb-4 rounded-lg border border-dashed border-orange-300 bg-orange-50 p-3 text-xs text-neutral-700">
                <p className="font-semibold mb-1">🛠 Dev credentials</p>
                <p>Email: <span className="font-mono">{import.meta.env.VITE_ADMIN_EMAIL}</span></p>
                <p>Password: <span className="font-mono">{import.meta.env.VITE_ADMIN_PASSWORD}</span></p>
              </div>
            )}

            <AuthForm
              onDone={async (isAdmin) => {
                if (!isAdmin) {
                  await supabase.auth.signOut();
                  toast.error("This account does not have admin access.");
                  return;
                }
                navigate({ to: "/admin" });
              }}
            />

            <div className="mt-6 rounded-xl border bg-muted/40 p-3 text-center text-xs text-muted-foreground">
              Looking for regular customer login?{" "}
              <Link to="/auth" className="font-semibold text-primary hover:underline">
                Customer Sign In →
              </Link>
            </div>
          </div>

          {/* Footer note */}
          <div className="text-center text-xs text-muted-foreground">
            ShopKart Security • Protected by row-level access verification
          </div>
        </div>
      </div>
    </div>
  );
}

