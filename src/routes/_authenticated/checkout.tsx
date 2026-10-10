import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState, type FormEvent } from "react";
import { z } from "zod";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { StoreShell } from "@/components/store/StoreShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { Summary, useCartTotals } from "@/components/store/order-bits";

export const Route = createFileRoute("/_authenticated/checkout")({
  head: () => ({
    meta: [
      { title: "Checkout — ShopKart" },
      { name: "description", content: "Enter shipping details and place your ShopKart order." },
      { property: "og:title", content: "Checkout — ShopKart" },
      { property: "og:description", content: "Place your order." },
    ],
  }),
  component: Checkout,
});

const schema = z.object({
  full_name: z.string().trim().min(2, "Enter your full name").max(100),
  email: z.string().trim().email("Enter a valid email").max(255),
  phone: z
    .string()
    .trim()
    .regex(/^[0-9+\-\s]{10,15}$/, "Enter a valid phone number"),
  address: z.string().trim().min(5, "Enter your address").max(300),
  city: z.string().trim().min(2, "Enter city").max(60),
  state: z.string().trim().min(2, "Enter state").max(60),
  pincode: z
    .string()
    .trim()
    .regex(/^\d{6}$/, "Pincode must be 6 digits"),
});

function Checkout() {
  const { user } = useAuth();
  const t = useCartTotals(user?.id);
  const [method, setMethod] = useState<"cod" | "upi" | "card">("cod");
  const [busy, setBusy] = useState(false);
  const [defaults, setDefaults] = useState<{
    full_name?: string;
    phone?: string;
    address?: string;
  }>({});
  const navigate = useNavigate();
  const qc = useQueryClient();

  useEffect(() => {
    if (!user) return;
    supabase
      .from("profiles")
      .select("full_name, phone, address")
      .eq("id", user.id)
      .maybeSingle()
      .then(({ data }) => {
        if (data)
          setDefaults({
            full_name: data.full_name ?? "",
            phone: data.phone ?? "",
            address: data.address ?? "",
          });
      });
  }, [user]);

  const submit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const parsed = schema.safeParse(Object.fromEntries(new FormData(e.currentTarget)));
    if (!parsed.success) {
      toast.error(parsed.error.issues[0]?.message ?? "Invalid input");
      return;
    }
    setBusy(true);
    // Demo payment processing
    await new Promise((r) => setTimeout(r, method === "cod" ? 300 : 1200));
    const { data, error } = await supabase.rpc("place_order", {
      _payment_method: method,
      _shipping: parsed.data,
    });
    setBusy(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    qc.invalidateQueries({ queryKey: ["cart"] });
    qc.invalidateQueries({ queryKey: ["products"] });
    qc.invalidateQueries({ queryKey: ["orders"] });
    toast.success("Order placed successfully!");
    navigate({ to: "/orders/$id", params: { id: data as string } });
  };

  if (!t.isLoading && t.items.length === 0)
    return (
      <StoreShell>
        <div className="p-16 text-center">
          <p className="text-lg font-semibold">Your cart is empty</p>
          <Link to="/products" className="mt-3 inline-block text-primary">
            Browse products
          </Link>
        </div>
      </StoreShell>
    );

  const f = (name: string, label: string, props: React.ComponentProps<"input"> = {}) => (
    <div className="space-y-1.5">
      <Label htmlFor={name}>{label}</Label>
      <Input id={name} name={name} required {...props} />
    </div>
  );

  return (
    <StoreShell>
      <form
        key={JSON.stringify(defaults)}
        onSubmit={submit}
        className="mx-auto grid max-w-6xl gap-8 px-4 py-10 lg:grid-cols-[1fr_360px]"
      >
        <div className="space-y-6">
          <h1 className="text-3xl font-bold">Checkout</h1>
          <section className="grid gap-4 rounded-2xl border bg-card p-5 sm:grid-cols-2">
            <h2 className="text-lg font-bold sm:col-span-2">Shipping details</h2>
            {f("full_name", "Full Name", { defaultValue: defaults.full_name })}
            {f("email", "Email", { type: "email", defaultValue: user?.email })}
            {f("phone", "Phone", { defaultValue: defaults.phone })}
            {f("pincode", "Pincode", { inputMode: "numeric", maxLength: 6 })}
            <div className="sm:col-span-2">
              {f("address", "Address", { defaultValue: defaults.address })}
            </div>
            {f("city", "City")}
            {f("state", "State")}
          </section>
          <section className="rounded-2xl border bg-card p-5">
            <h2 className="mb-3 text-lg font-bold">Payment method</h2>
            <div className="grid gap-3 sm:grid-cols-3">
              {(
                [
                  ["cod", "Cash on Delivery"],
                  ["upi", "UPI"],
                  ["card", "Card"],
                ] as const
              ).map(([k, l]) => (
                <button
                  type="button"
                  key={k}
                  onClick={() => setMethod(k)}
                  className={`rounded-xl border-2 p-4 text-left font-semibold transition ${method === k ? "border-primary bg-primary/5" : "hover:border-muted-foreground/40"}`}
                >
                  {l}
                </button>
              ))}
            </div>
            {method === "upi" && <Input className="mt-4" placeholder="yourname@upi (demo)" />}
            {method === "card" && (
              <div className="mt-4 grid gap-3 sm:grid-cols-3">
                <Input className="sm:col-span-3" placeholder="4111 1111 1111 1111 (demo)" />
                <Input placeholder="MM/YY" />
                <Input placeholder="CVV" />
              </div>
            )}
            <p className="mt-3 text-xs text-muted-foreground">
              Demo payments only — no real money is charged.
            </p>
          </section>
        </div>
        <aside className="h-fit rounded-2xl border bg-card p-5 lg:mt-14">
          <h2 className="mb-4 text-lg font-bold">Order summary</h2>
          <ul className="mb-4 space-y-1 text-sm text-muted-foreground">
            {t.items.map((c) => (
              <li key={c.id} className="flex justify-between">
                <span className="truncate">
                  {c.products.name} × {c.quantity}
                </span>
              </li>
            ))}
          </ul>
          <Summary t={t} />
          <Button type="submit" size="lg" className="mt-5 w-full rounded-full" disabled={busy}>
            {busy ? "Processing…" : "Place order"}
          </Button>
        </aside>
      </form>
    </StoreShell>
  );
}
