import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { AuthForm } from "@/components/AuthForm";
import { supabase } from "@/integrations/supabase/client";

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
    <div className="admin-theme grid min-h-screen place-items-center bg-sidebar px-4">
      <div className="w-full max-w-md">
        <div className="mb-6 flex items-center justify-center gap-2 text-sidebar-foreground">
          <ShieldCheck className="h-7 w-7 text-sidebar-primary" />
          <span className="font-display text-2xl font-bold">ShopKart Admin</span>
        </div>
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
        <p className="mt-4 text-center text-sm text-sidebar-foreground/70">
          <Link to="/">← Back to store</Link>
        </p>
      </div>
    </div>
  );
}
