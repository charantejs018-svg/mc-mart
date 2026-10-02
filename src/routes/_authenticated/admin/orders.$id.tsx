import { createFileRoute, Link } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { PageHeader, Panel, setOrderStatus } from "@/components/admin/bits";
import { Tracker, useOrder } from "@/components/store/order-bits";
import { ALL_STATUSES, inr, paymentLabel, statusLabel, statusTone, type OrderStatus } from "@/lib/shop";

export const Route = createFileRoute("/_authenticated/admin/orders/$id")({
  head: () => ({ meta: [{ title: "Order Details — ShopKart Admin" }, { name: "description", content: "View and update a ShopKart order." }, { property: "og:title", content: "Order Details — ShopKart Admin" }, { property: "og:description", content: "Order details." }] }),
  component: AdminOrderDetail,
});

function AdminOrderDetail() {
  const { id } = Route.useParams();
  const { data: o, isLoading } = useOrder(id);
  const qc = useQueryClient();
  if (isLoading) return <p className="text-muted-foreground">Loading…</p>;
  if (!o) return <p>Order not found.</p>;
  const s = o.shipping_address as Record<string, string>;

  return (
    <div>
      <Link to="/admin/orders" className="text-sm text-muted-foreground">← All orders</Link>
      <PageHeader
        title={`Order #${o.id.slice(0, 8).toUpperCase()}`}
        sub={`Placed ${new Date(o.created_at).toLocaleString("en-IN")}`}
        action={<span className={`rounded-full px-3 py-1 text-sm font-semibold ${statusTone(o.status)}`}>{statusLabel(o.status)}</span>}
      />
      <Panel className="mb-6"><Tracker status={o.status} /></Panel>
      <div className="grid gap-6 lg:grid-cols-3">
        <Panel className="lg:col-span-2">
          <h2 className="mb-3 font-semibold">Items</h2>
          <table className="w-full text-sm">
            <thead className="text-left text-xs text-muted-foreground"><tr><th className="pb-2">Product</th><th>Qty</th><th>Price</th><th className="text-right">Subtotal</th></tr></thead>
            <tbody>
              {o.order_items.map((i) => (
                <tr key={i.id} className="border-t"><td className="py-2">{i.product_name}</td><td>{i.quantity}</td><td>{inr(Number(i.price))}</td><td className="text-right">{inr(Number(i.price) * i.quantity)}</td></tr>
              ))}
            </tbody>
          </table>
          <div className="mt-3 flex justify-between border-t pt-3 font-bold"><span>Total (incl. delivery)</span><span>{inr(Number(o.total_amount))}</span></div>
          <p className="mt-1 text-sm text-muted-foreground">Payment: {paymentLabel(o.payment_method)}</p>
        </Panel>
        <div className="space-y-6">
          <Panel>
            <h2 className="mb-3 font-semibold">Update status</h2>
            <select
              value={o.status}
              onChange={async (e) => {
                await setOrderStatus(o.id, e.target.value as OrderStatus);
                qc.invalidateQueries({ queryKey: ["orders"] });
              }}
              className="h-10 w-full rounded-md border bg-card px-3 text-sm"
            >
              {ALL_STATUSES.map((st) => <option key={st} value={st}>{statusLabel(st)}</option>)}
            </select>
          </Panel>
          <Panel>
            <h2 className="mb-3 font-semibold">Customer</h2>
            <div className="space-y-1 text-sm">
              <p className="font-medium">{s.full_name}</p>
              <p className="text-muted-foreground">{s.email}</p>
              <p className="text-muted-foreground">{s.phone}</p>
              <p className="pt-2">{s.address}</p>
              <p>{s.city}, {s.state} – {s.pincode}</p>
            </div>
          </Panel>
        </div>
      </div>
    </div>
  );
}
