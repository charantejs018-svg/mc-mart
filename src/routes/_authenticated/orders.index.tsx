<<<<<<< HEAD
import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Package, Truck, CheckCircle2, XCircle, Clock } from "lucide-react";
import { StoreShell } from "@/components/store/StoreShell";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth";
import {
  inr,
  paymentLabel,
  statusLabel,
  statusTone,
  useUserOrders,
  type OrderStatus,
} from "@/lib/shop";
=======
import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Package } from "lucide-react";
import { StoreShell } from "@/components/store/StoreShell";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { inr, paymentLabel, statusLabel, statusTone, useRealtime } from "@/lib/shop";
>>>>>>> d6d63d17ae872d574523a28a00253918fd95352d

export const Route = createFileRoute("/_authenticated/orders/")({
  head: () => ({
    meta: [
      { title: "My Orders — ShopKart" },
      { name: "description", content: "View your ShopKart order history." },
      { property: "og:title", content: "My Orders — ShopKart" },
      { property: "og:description", content: "Your order history." },
    ],
  }),
  component: MyOrders,
});

<<<<<<< HEAD
type FilterTab = "all" | "active" | "delivered" | "cancelled";

function MyOrders() {
  const { user } = useAuth();
  const [filter, setFilter] = useState<FilterTab>("all");
  const { data: allOrders, isLoading } = useUserOrders(user?.id);

  const filteredOrders = (allOrders ?? []).filter((o) => {
    if (filter === "all") return true;
    if (filter === "delivered") return o.status === "delivered";
    if (filter === "cancelled") return o.status === "cancelled";
    if (filter === "active") return !["delivered", "cancelled"].includes(o.status);
    return true;
  });

  const activeCount =
    allOrders?.filter((o) => !["delivered", "cancelled"].includes(o.status)).length ?? 0;
  const deliveredCount = allOrders?.filter((o) => o.status === "delivered").length ?? 0;
  const cancelledCount = allOrders?.filter((o) => o.status === "cancelled").length ?? 0;

  return (
    <StoreShell>
      <div className="mx-auto max-w-5xl px-4 py-10">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold">My orders</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Track active deliveries, inspect past purchases, and view invoices.
            </p>
          </div>
          <Button asChild variant="outline" className="rounded-full">
            <Link to="/products">Browse Catalog</Link>
          </Button>
        </div>

        {/* Filter Tabs */}
        {allOrders && allOrders.length > 0 && (
          <div className="mt-6 flex flex-wrap gap-2 border-b pb-3">
            <button
              onClick={() => setFilter("all")}
              className={`rounded-full px-4 py-1.5 text-xs font-semibold transition-colors ${
                filter === "all"
                  ? "bg-primary text-primary-foreground shadow-xs"
                  : "bg-muted text-muted-foreground hover:bg-muted/80"
              }`}
            >
              All Orders ({allOrders.length})
            </button>
            <button
              onClick={() => setFilter("active")}
              className={`inline-flex items-center gap-1.5 rounded-full px-4 py-1.5 text-xs font-semibold transition-colors ${
                filter === "active"
                  ? "bg-primary text-primary-foreground shadow-xs"
                  : "bg-muted text-muted-foreground hover:bg-muted/80"
              }`}
            >
              <Clock className="h-3.5 w-3.5" />
              In Progress ({activeCount})
            </button>
            <button
              onClick={() => setFilter("delivered")}
              className={`inline-flex items-center gap-1.5 rounded-full px-4 py-1.5 text-xs font-semibold transition-colors ${
                filter === "delivered"
                  ? "bg-primary text-primary-foreground shadow-xs"
                  : "bg-muted text-muted-foreground hover:bg-muted/80"
              }`}
            >
              <CheckCircle2 className="h-3.5 w-3.5" />
              Delivered ({deliveredCount})
            </button>
            {cancelledCount > 0 && (
              <button
                onClick={() => setFilter("cancelled")}
                className={`inline-flex items-center gap-1.5 rounded-full px-4 py-1.5 text-xs font-semibold transition-colors ${
                  filter === "cancelled"
                    ? "bg-primary text-primary-foreground shadow-xs"
                    : "bg-muted text-muted-foreground hover:bg-muted/80"
                }`}
              >
                <XCircle className="h-3.5 w-3.5" />
                Cancelled ({cancelledCount})
              </button>
            )}
          </div>
        )}

        {isLoading ? (
          <div className="mt-8 space-y-4">
            <div className="h-32 w-full animate-pulse rounded-2xl bg-muted" />
            <div className="h-32 w-full animate-pulse rounded-2xl bg-muted" />
          </div>
        ) : !allOrders?.length ? (
          <div className="mt-8 rounded-3xl border bg-card p-14 text-center">
            <Package className="mx-auto h-12 w-12 text-muted-foreground" />
            <p className="mt-4 font-semibold">No orders yet</p>
            <p className="mt-1 text-sm text-muted-foreground">
              When you purchase items, your orders and tracking status will appear here.
            </p>
=======
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
>>>>>>> d6d63d17ae872d574523a28a00253918fd95352d
            <Button asChild className="mt-5 rounded-full">
              <Link to="/products">Shop now</Link>
            </Button>
          </div>
<<<<<<< HEAD
        ) : !filteredOrders.length ? (
          <div className="mt-8 rounded-2xl border bg-card/60 p-10 text-center text-muted-foreground">
            No orders found under &quot;{filter}&quot;.
          </div>
        ) : (
          <ul className="mt-6 space-y-4">
            {filteredOrders.map((o) => (
              <li
                key={o.id}
                className="group rounded-2xl border bg-card p-5 shadow-xs transition-shadow hover:shadow-md"
              >
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="font-mono text-sm font-semibold text-foreground">
                      #{o.id.slice(0, 8).toUpperCase()}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(o.created_at).toLocaleString("en-IN", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                  <span
                    className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold ${statusTone(
                      o.status as OrderStatus,
                    )}`}
                  >
                    <Truck className="h-3.5 w-3.5" />
                    {statusLabel(o.status as OrderStatus)}
                  </span>
                </div>

                <div className="mt-3 divide-y rounded-xl bg-muted/30 p-3 text-sm">
                  {o.order_items.map((i) => (
                    <div
                      key={i.id}
                      className="flex items-center justify-between py-1.5 first:pt-0 last:pb-0"
                    >
                      <span className="font-medium text-foreground">
                        {i.product_name} <span className="text-muted-foreground">× {i.quantity}</span>
                      </span>
                      <span className="font-mono text-xs text-muted-foreground">
                        {inr(Number(i.price) * i.quantity)}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="mt-4 flex flex-wrap items-center justify-between gap-3 pt-2">
                  <p className="text-sm text-muted-foreground">
                    Total:{" "}
=======
        ) : (
          <ul className="mt-6 space-y-4">
            {data.map((o) => (
              <li key={o.id} className="rounded-2xl border bg-card p-5">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="font-mono text-sm font-semibold">
                      #{o.id.slice(0, 8).toUpperCase()}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(o.created_at).toLocaleString("en-IN")}
                    </p>
                  </div>
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-bold ${statusTone(o.status)}`}
                  >
                    {statusLabel(o.status)}
                  </span>
                </div>
                <p className="mt-3 text-sm">
                  {o.order_items.map((i) => `${i.product_name} × ${i.quantity}`).join(", ")}
                </p>
                <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                  <p className="text-sm text-muted-foreground">
>>>>>>> d6d63d17ae872d574523a28a00253918fd95352d
                    <span className="font-display text-lg font-bold text-foreground">
                      {inr(Number(o.total_amount))}
                    </span>{" "}
                    · {paymentLabel(o.payment_method)}
                  </p>
                  <Button asChild size="sm" variant="outline" className="rounded-full">
                    <Link to="/orders/$id" params={{ id: o.id }}>
<<<<<<< HEAD
                      Track Order →
=======
                      Track Order
>>>>>>> d6d63d17ae872d574523a28a00253918fd95352d
                    </Link>
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
<<<<<<< HEAD

=======
>>>>>>> d6d63d17ae872d574523a28a00253918fd95352d
