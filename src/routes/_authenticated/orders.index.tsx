import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Package } from "lucide-react";
import { StoreShell } from "@/components/store/StoreShell";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { inr, paymentLabel, statusLabel, statusTone, useRealtime } from "@/lib/shop";

export const Route = createFileRoute("/_authenticated/orders/")({
  head: () => ({ meta: [{ title: "My Orders — ShopKart" }, { name: "description", content: "View your ShopKart order history." }, { property: "og:title", content: "My Orders — ShopKart" }, { property: "og:description", content: "Your order history." }] }),
  component: MyOrders,
});

function MyOrders() {
  const { user } = useAuth();
  useRealtime("orders", [["orders"]]);
  const { data, isLoading } = useQuery({
    queryKey: ["orders", "mine", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("orders")
        .select("*, order_items(product_name, quantity)")
        .eq("user_id", user!.id)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  return (
    <StoreShell>
      <div className="mx-auto max-w-5xl px-4 py-10">
        <h1 className="text-3xl font-bold">My orders</h1>
        {isLoading ? (
          <p className="mt-6 text-muted-foreground">Loading…</p>
        ) : !data?.length ? (
          <div className="mt-8 rounded-3xl border bg-card p-14 text-center">
            <Package className="mx-auto h-12 w-12 text-muted-foreground" />
            <p className="mt-4 font-semibold">No orders yet</p>
            <Button asChild className="mt-5 rounded-full"><Link to="/products">Shop now</Link></Button>
          </div>
        ) : (
          <ul className="mt-6 space-y-4">
            {data.map((o) => (
              <li key={o.id} className="rounded-2xl border bg-card p-5">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="font-mono text-sm font-semibold">#{o.id.slice(0, 8).toUpperCase()}</p>
                    <p className="text-xs text-muted-foreground">{new Date(o.created_at).toLocaleString("en-IN")}</p>
                  </div>
                  <span className={`rounded-full px-3 py-1 text-xs font-bold ${statusTone(o.status)}`}>{statusLabel(o.status)}</span>
                </div>
                <p className="mt-3 text-sm">{o.order_items.map((i) => `${i.product_name} × ${i.quantity}`).join(", ")}</p>
                <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                  <p className="text-sm text-muted-foreground">
                    <span className="font-display text-lg font-bold text-foreground">{inr(Number(o.total_amount))}</span> · {paymentLabel(o.payment_method)}
                  </p>
                  <Button asChild size="sm" variant="outline" className="rounded-full">
                    <Link to="/orders/$id" params={{ id: o.id }}>Track Order</Link>
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </StoreShell>
  );
}
