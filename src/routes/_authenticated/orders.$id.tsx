import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Check, XCircle } from "lucide-react";
import { StoreShell } from "@/components/store/StoreShell";
import { supabase } from "@/integrations/supabase/client";
import { inr, ORDER_STEPS, paymentLabel, statusLabel, statusTone, useRealtime } from "@/lib/shop";

export const Route = createFileRoute("/_authenticated/orders/$id")({
  head: () => ({ meta: [{ title: "Track Order — ShopKart" }, { name: "description", content: "Track the status of your ShopKart order." }, { property: "og:title", content: "Track Order — ShopKart" }, { property: "og:description", content: "Track your order." }] }),
  component: TrackOrder,
});

export function useOrder(id: string) {
  useRealtime("orders", [["orders"]]);
  return useQuery({
    queryKey: ["orders", "one", id],
    queryFn: async () => {
      const { data, error } = await supabase.from("orders").select("*, order_items(*)").eq("id", id).maybeSingle();
      if (error) throw error;
      return data;
    },
  });
}

export function Tracker({ status }: { status: string }) {
  if (status === "cancelled")
    return (
      <div className="flex items-center gap-3 rounded-2xl bg-destructive/10 p-5 font-semibold text-destructive">
        <XCircle className="h-6 w-6" /> This order was cancelled.
      </div>
    );
  const idx = ORDER_STEPS.findIndex((s) => s.key === status);
  return (
    <ol className="grid gap-4 sm:grid-cols-6">
      {ORDER_STEPS.map((s, i) => {
        const done = i <= idx;
        const current = i === idx;
        return (
          <li key={s.key} className="flex items-center gap-3 sm:flex-col sm:text-center">
            <div className="relative flex w-full items-center sm:justify-center">
              {i > 0 && <span className={`absolute right-1/2 hidden h-1 w-full -translate-y-0 sm:block ${i <= idx ? "bg-primary" : "bg-border"}`} />}
              <span className={`relative z-10 grid h-10 w-10 shrink-0 place-items-center rounded-full border-2 font-bold ${done ? "border-primary bg-primary text-primary-foreground" : "border-border bg-card text-muted-foreground"} ${current ? "ring-4 ring-primary/25" : ""}`}>
                {done ? <Check className="h-5 w-5" /> : i + 1}
              </span>
            </div>
            <span className={`text-sm ${current ? "font-bold text-primary" : done ? "font-semibold" : "text-muted-foreground"}`}>{s.label}</span>
          </li>
        );
      })}
    </ol>
  );
}

function TrackOrder() {
  const { id } = Route.useParams();
  const { data: o, isLoading } = useOrder(id);
  if (isLoading) return <StoreShell><p className="p-10 text-center text-muted-foreground">Loading…</p></StoreShell>;
  if (!o) return <StoreShell><p className="p-10 text-center">Order not found. <Link to="/orders" className="text-primary">My orders</Link></p></StoreShell>;
  const ship = o.shipping_address as Record<string, string>;
  return (
    <StoreShell>
      <div className="mx-auto max-w-5xl px-4 py-10">
        <Link to="/orders" className="text-sm text-muted-foreground">← My orders</Link>
        <div className="mt-2 flex flex-wrap items-center justify-between gap-3">
          <h1 className="text-3xl font-bold">Order #{o.id.slice(0, 8).toUpperCase()}</h1>
          <span className={`rounded-full px-3 py-1 text-sm font-bold ${statusTone(o.status)}`}>{statusLabel(o.status)}</span>
        </div>
        <p className="text-sm text-muted-foreground">Placed {new Date(o.created_at).toLocaleString("en-IN")}</p>
        <div className="mt-8 rounded-2xl border bg-card p-6"><Tracker status={o.status} /></div>
        <div className="mt-6 grid gap-6 md:grid-cols-2">
          <div className="rounded-2xl border bg-card p-5">
            <h2 className="mb-3 font-bold">Items</h2>
            <ul className="space-y-2 text-sm">
              {o.order_items.map((i) => (
                <li key={i.id} className="flex justify-between"><span>{i.product_name} × {i.quantity}</span><span>{inr(Number(i.price) * i.quantity)}</span></li>
              ))}
            </ul>
            <div className="mt-3 flex justify-between border-t pt-3 font-bold"><span>Total</span><span>{inr(Number(o.total_amount))}</span></div>
            <p className="mt-2 text-sm text-muted-foreground">Paid via {paymentLabel(o.payment_method)}</p>
          </div>
          <div className="rounded-2xl border bg-card p-5 text-sm">
            <h2 className="mb-3 font-bold">Shipping to</h2>
            <p className="font-semibold">{ship.full_name}</p>
            <p>{ship.address}</p>
            <p>{ship.city}, {ship.state} – {ship.pincode}</p>
            <p className="mt-2 text-muted-foreground">{ship.phone} · {ship.email}</p>
          </div>
        </div>
      </div>
    </StoreShell>
  );
}
