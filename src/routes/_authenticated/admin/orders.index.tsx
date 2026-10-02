import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Search, Eye } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { PageHeader, Panel, setOrderStatus, useAllOrders } from "@/components/admin/bits";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ALL_STATUSES, inr, paymentLabel, statusLabel, statusTone, type OrderStatus } from "@/lib/shop";

export const Route = createFileRoute("/_authenticated/admin/orders/")({
  head: () => ({ meta: [{ title: "Orders — ShopKart Admin" }, { name: "description", content: "Manage ShopKart customer orders." }, { property: "og:title", content: "Orders — ShopKart Admin" }, { property: "og:description", content: "Manage orders." }] }),
  component: AdminOrders,
});

function AdminOrders() {
  const { data: orders = [], isLoading } = useAllOrders();
  const [q, setQ] = useState("");
  const [status, setStatus] = useState("");
  const qc = useQueryClient();

  const list = useMemo(
    () =>
      orders.filter((o) => {
        const s = o.shipping_address as Record<string, string>;
        const hay = `${o.id} ${s.full_name} ${s.email}`.toLowerCase();
        return hay.includes(q.toLowerCase()) && (!status || o.status === status);
      }),
    [orders, q, status],
  );

  return (
    <div>
      <PageHeader title="Orders" sub={`${orders.length} total orders`} />
      <Panel>
        <div className="mb-4 flex flex-wrap gap-3">
          <div className="relative min-w-52 flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input className="pl-9" placeholder="Search by order ID, name or email…" value={q} onChange={(e) => setQ(e.target.value)} />
          </div>
          <select value={status} onChange={(e) => setStatus(e.target.value)} className="h-9 rounded-md border bg-card px-3 text-sm">
            <option value="">All statuses</option>
            {ALL_STATUSES.map((s) => <option key={s} value={s}>{statusLabel(s)}</option>)}
          </select>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[960px] text-sm">
            <thead className="text-left text-xs uppercase text-muted-foreground">
              <tr><th className="pb-3">Order ID</th><th>Customer</th><th>Email</th><th>Date</th><th>Products</th><th>Total</th><th>Payment</th><th>Status</th><th className="text-right">Actions</th></tr>
            </thead>
            <tbody>
              {isLoading && <tr><td colSpan={9} className="py-6 text-center text-muted-foreground">Loading…</td></tr>}
              {list.map((o) => {
                const s = o.shipping_address as Record<string, string>;
                return (
                  <tr key={o.id} className="border-t align-top">
                    <td className="py-3 font-mono font-semibold">#{o.id.slice(0, 8).toUpperCase()}</td>
                    <td>{s.full_name}</td>
                    <td className="text-muted-foreground">{s.email}</td>
                    <td>{new Date(o.created_at).toLocaleDateString("en-IN")}</td>
                    <td className="max-w-48">{o.order_items.map((i) => `${i.product_name} ×${i.quantity}`).join(", ")}</td>
                    <td className="font-semibold">{inr(Number(o.total_amount))}</td>
                    <td>{paymentLabel(o.payment_method)}</td>
                    <td>
                      <select
                        value={o.status}
                        onChange={async (e) => {
                          await setOrderStatus(o.id, e.target.value as OrderStatus);
                          qc.invalidateQueries({ queryKey: ["orders"] });
                        }}
                        className={`rounded-full border-0 px-2 py-1 text-xs font-semibold ${statusTone(o.status)}`}
                      >
                        {ALL_STATUSES.map((st) => <option key={st} value={st}>{statusLabel(st)}</option>)}
                      </select>
                    </td>
                    <td className="text-right">
                      <Button asChild size="sm" variant="outline"><Link to="/admin/orders/$id" params={{ id: o.id }}><Eye className="mr-1 h-3.5 w-3.5" />View</Link></Button>
                    </td>
                  </tr>
                );
              })}
              {!isLoading && list.length === 0 && <tr><td colSpan={9} className="py-6 text-center text-muted-foreground">No orders found</td></tr>}
            </tbody>
          </table>
        </div>
      </Panel>
    </div>
  );
}
