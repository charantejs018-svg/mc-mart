import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
<<<<<<< HEAD
import { ArrowLeft, ShieldCheck, Zap, PackageCheck, Sparkles } from "lucide-react";
import { AuthForm } from "@/components/AuthForm";
import loginBanner from "@/assets/login-banner.jpg";
=======
import { AuthForm } from "@/components/AuthForm";
>>>>>>> d6d63d17ae872d574523a28a00253918fd95352d

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Login or Register — ShopKart" },
      { name: "description", content: "Sign in to your ShopKart account or create a new one." },
      { property: "og:title", content: "Login — ShopKart" },
      { property: "og:description", content: "Sign in or create your ShopKart account." },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const navigate = useNavigate();
<<<<<<< HEAD

  return (
    <div className="min-h-screen bg-muted/30">
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
                Express
              </span>
            </Link>
            <div className="flex items-center gap-1.5 rounded-full bg-white/80 px-3 py-1 text-xs font-medium text-neutral-700 shadow-xs backdrop-blur-sm">
              <Sparkles className="h-3.5 w-3.5 text-primary" />
              Over 50K+ Happy Shoppers
            </div>
          </div>

          {/* Centerpiece Image Showcase */}
          <div className="relative z-10 my-auto py-8">
            <div className="group relative mx-auto max-w-xl overflow-hidden rounded-3xl border border-white/80 bg-white/30 p-2.5 shadow-2xl shadow-orange-950/15 backdrop-blur-sm transition-all duration-300 hover:shadow-orange-950/25">
              <div className="overflow-hidden rounded-2xl bg-[#ebb980]">
                <img
                  src={loginBanner}
                  alt="ShopKart quick delivery service"
                  className="h-auto w-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                />
              </div>
              <div className="mt-3 px-3 pb-2 text-center">
                <p className="text-base font-bold text-neutral-900">
                  Every product you love, delivered in minutes.
                </p>
                <p className="mt-0.5 text-xs text-neutral-700">
                  Live GPS tracking • Zero hassle returns • Direct from certified sellers
                </p>
              </div>
            </div>

            {/* Feature Pills */}
            <div className="mt-8 grid grid-cols-3 gap-3 max-w-xl mx-auto">
              <div className="flex items-center gap-2.5 rounded-xl border border-white/60 bg-white/70 p-3 shadow-xs backdrop-blur-sm">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <Zap className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-xs font-bold text-neutral-900">Superfast</p>
                  <p className="text-[11px] text-neutral-600">30-min express</p>
                </div>
              </div>

              <div className="flex items-center gap-2.5 rounded-xl border border-white/60 bg-white/70 p-3 shadow-xs backdrop-blur-sm">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <PackageCheck className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-xs font-bold text-neutral-900">Easy Returns</p>
                  <p className="text-[11px] text-neutral-600">7-day replacement</p>
                </div>
              </div>

              <div className="flex items-center gap-2.5 rounded-xl border border-white/60 bg-white/70 p-3 shadow-xs backdrop-blur-sm">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <ShieldCheck className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-xs font-bold text-neutral-900">100% Genuine</p>
                  <p className="text-[11px] text-neutral-600">Verified products</p>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Trust Note */}
          <div className="relative z-10 flex items-center justify-between text-xs text-neutral-600">
            <span>© {new Date().getFullYear()} ShopKart Inc. All rights reserved.</span>
            <span className="flex items-center gap-1">
              <ShieldCheck className="h-3.5 w-3.5 text-primary" /> 256-bit Secure Encryption
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

            <Link
              to="/"
              className="font-display text-2xl font-black lg:hidden"
            >
              Shop<span className="text-primary">Kart</span>
            </Link>
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
                ⚡ Order now and get quick doorstep delivery!
              </div>
            </div>

            <AuthForm
              allowRegister
              onDone={(isAdmin) => navigate({ to: isAdmin ? "/admin" : "/" })}
            />

            <div className="mt-6 rounded-xl border bg-muted/40 p-3 text-center text-xs text-muted-foreground">
              Store administrator?{" "}
              <Link to="/admin-login" className="font-semibold text-primary hover:underline">
                Go to Admin Portal →
              </Link>
            </div>
          </div>

          {/* Footer note */}
          <div className="text-center text-xs text-muted-foreground">
            By signing in, you agree to ShopKart&apos;s Terms of Service and Privacy Policy.
          </div>
        </div>
=======
  return (
    <div className="grid min-h-screen place-items-center bg-muted px-4">
      <div className="w-full max-w-md">
        <Link to="/" className="mb-6 block text-center font-display text-3xl font-extrabold">
          Shop<span className="text-primary">Kart</span>
        </Link>
        <AuthForm allowRegister onDone={(isAdmin) => navigate({ to: isAdmin ? "/admin" : "/" })} />
        <p className="mt-4 text-center text-sm text-muted-foreground">
          Store admin?{" "}
          <Link to="/admin-login" className="font-semibold text-primary">
            Admin login
          </Link>
        </p>
>>>>>>> d6d63d17ae872d574523a28a00253918fd95352d
      </div>
    </div>
  );
}
<<<<<<< HEAD

=======
>>>>>>> d6d63d17ae872d574523a28a00253918fd95352d
