import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState, type FormEvent } from "react";
import { z } from "zod";
import { toast } from "sonner";
import { StoreShell } from "@/components/store/StoreShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";

export const Route = createFileRoute("/_authenticated/profile")({
  head: () => ({ meta: [{ title: "My Profile — ShopKart" }, { name: "description", content: "Manage your ShopKart profile." }, { property: "og:title", content: "My Profile — ShopKart" }, { property: "og:description", content: "Manage your profile." }] }),
  component: Profile,
});

const schema = z.object({
  full_name: z.string().trim().min(2, "Enter your name").max(100),
  phone: z.string().trim().max(15).regex(/^[0-9+\-\s]*$/, "Invalid phone"),
  address: z.string().trim().max(300),
});

function Profile() {
  const { user } = useAuth();
  const qc = useQueryClient();
  const [busy, setBusy] = useState(false);
  const { data } = useQuery({
    queryKey: ["profile", user?.id],
    enabled: !!user,
    queryFn: async () => (await supabase.from("profiles").select("*").eq("id", user!.id).maybeSingle()).data,
  });

  const submit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const parsed = schema.safeParse(Object.fromEntries(new FormData(e.currentTarget)));
    if (!parsed.success) return toast.error(parsed.error.issues[0].message);
    setBusy(true);
    const { error } = await supabase.from("profiles").update(parsed.data).eq("id", user!.id);
    setBusy(false);
    if (error) return toast.error(error.message);
    qc.invalidateQueries({ queryKey: ["profile"] });
    toast.success("Profile updated");
  };

  return (
    <StoreShell>
      <div className="mx-auto max-w-xl px-4 py-10">
        <h1 className="text-3xl font-bold">My profile</h1>
        <form key={data?.id} onSubmit={submit} className="mt-6 space-y-4 rounded-2xl border bg-card p-6">
          <div className="space-y-1.5"><Label>Email</Label><Input value={user?.email ?? ""} disabled /></div>
          <div className="space-y-1.5"><Label htmlFor="full_name">Full name</Label><Input id="full_name" name="full_name" defaultValue={data?.full_name ?? ""} /></div>
          <div className="space-y-1.5"><Label htmlFor="phone">Phone</Label><Input id="phone" name="phone" defaultValue={data?.phone ?? ""} /></div>
          <div className="space-y-1.5"><Label htmlFor="address">Address</Label><Textarea id="address" name="address" defaultValue={data?.address ?? ""} /></div>
          <Button type="submit" disabled={busy}>{busy ? "Saving…" : "Save changes"}</Button>
        </form>
      </div>
    </StoreShell>
  );
}
