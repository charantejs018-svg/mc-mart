import { createFileRoute } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { toast } from "sonner";
import { PageHeader, Panel } from "@/components/admin/bits";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";

export const Route = createFileRoute("/_authenticated/admin/settings")({
  head: () => ({ meta: [{ title: "Settings — ShopKart Admin" }, { name: "description", content: "ShopKart admin settings." }, { property: "og:title", content: "Settings — ShopKart Admin" }, { property: "og:description", content: "Admin settings." }] }),
  component: Settings,
});

function Settings() {
  const { user } = useAuth();
  const [busy, setBusy] = useState(false);

  const changePassword = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const current = String(fd.get("current") ?? "");
    const next = String(fd.get("next") ?? "");
    if (next.length < 6) { toast.error("New password must be at least 6 characters"); return; }
    setBusy(true);
    const { error } = await supabase.auth.updateUser({ password: next, current_password: current } as never);
    setBusy(false);
    if (error) { toast.error(error.message); return; }
    toast.success("Password updated");
    e.currentTarget.reset();
  };

  return (
    <div className="max-w-3xl">
      <PageHeader title="Settings" />
      <div className="space-y-6">
        <Panel>
          <h2 className="font-semibold">Admin account</h2>
          <p className="mt-1 text-sm text-muted-foreground">Signed in as <span className="font-medium text-foreground">{user?.email}</span></p>
        </Panel>
        <Panel>
          <h2 className="mb-4 font-semibold">Store rules</h2>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li>Currency: Indian Rupee (₹)</li>
            <li>Delivery fee: ₹49, free on orders of ₹999 or more</li>
            <li>Payments: Cash on Delivery, UPI and Card (demo mode)</li>
          </ul>
        </Panel>
        <Panel>
          <h2 className="mb-4 font-semibold">Change password</h2>
          <form onSubmit={changePassword} className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5"><Label htmlFor="current">Current password</Label><Input id="current" name="current" type="password" required /></div>
            <div className="space-y-1.5"><Label htmlFor="next">New password</Label><Input id="next" name="next" type="password" required minLength={6} /></div>
            <div><Button type="submit" disabled={busy}>{busy ? "Updating…" : "Update password"}</Button></div>
          </form>
        </Panel>
      </div>
    </div>
  );
}
