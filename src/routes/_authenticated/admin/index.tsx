import type { Ship } from "@/lib/shop";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Package, Users, ShoppingBag, IndianRupee, Clock, CheckCircle2 } from "lucide-react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { PageHeader, Panel, useAllOrders, useAllUsers } from "@/components/admin/bits";
import { inr, statusLabel, statusTone, useCategories, useProducts, ALL_STATUSES } from "@/lib/shop";

export const Route = createFileRoute("/_authenticated/admin/")({
  head: () => ({
    meta: [
      { title: "Admin Dashboard — ShopKart" },
      { name: "description", content: "ShopKart store overview." },
      { property: "og:title", content: "Admin Dashboard — ShopKart" },
      { property: "og:description", content: "Store overview." },
    ],
  }),
  component: Dashboard,
});

const COLORS = [
  "var(--chart-1)",
  "var(--chart-2)",
  "var(--chart-3)",
  "var(--chart-4)",
  "var(--chart-5)",
  "var(--primary)",
  "var(--muted-foreground)",
];

function Dashboard() {
  const { data: products = [] } = useProducts();
  const { data: orders = [] } = useAllOrders();
  const { data: users = [] } = useAllUsers();
  const { data: categories = [] } = useCategories();

  const active = orders.filter((o) => o.status !== "cancelled");
  const revenue = active.reduce((s, o) => s + Number(o.total_amount), 0);
  const stats = [
    { label: "Total Products", value: products.length, icon: Package },
    { label: "Total Users", value: users.length, icon: Users },
    { label: "Total Orders", value: orders.length, icon: ShoppingBag },
    { label: "Total Revenue", value: inr(revenue), icon: IndianRupee },
    {
      label: "Pending Orders",
      value: orders.filter((o) => o.status === "pending").length,
      icon: Clock,
    },
    {
      label: "Delivered Orders",
      value: orders.filter((o) => o.status === "delivered").length,
      icon: CheckCircle2,
    },
  ];

  const days = Array.from({ length: 14 }).map((_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (13 - i));
    const key = d.toISOString().slice(0, 10);
    return {
      day: d.toLocaleDateString("en-IN", { day: "2-digit", month: "short" }),
      sales: active
        .filter((o) => o.created_at.slice(0, 10) === key)
        .reduce((s, o) => s + Number(o.total_amount), 0),
    };
  });
  const byStatus = ALL_STATUSES.map((s) => ({
    name: statusLabel(s),
    value: orders.filter((o) => o.status === s).length,
  })).filter((x) => x.value > 0);
  const byCat = categories.map((c) => ({
    name: c.name,
    count: products.filter((p) => p.category_id === c.id).length,
  }));

  return (
    <div>
      <PageHeader title="Dashboard" sub="Live overview of your store" />
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-3 xl:grid-cols-6">
        {stats.map(({ label, value, icon: Icon }) => (
          <Panel key={label}>
            <div className="flex items-center justify-between text-muted-foreground">
              <span className="text-xs font-medium">{label}</span>
              <Icon className="h-4 w-4" />
            </div>
            <p className="mt-2 font-display text-2xl font-bold">{value}</p>
          </Panel>
        ))}
      </div>
      <div className="mt-6 grid gap-6 xl:grid-cols-3">
        <Panel className="xl:col-span-2">
          <h2 className="mb-4 font-semibold">Sales Overview (last 14 days)</h2>
          <div className="h-64">
            <ResponsiveContainer>
              <AreaChart data={days}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="day" fontSize={11} stroke="var(--muted-foreground)" />
                <YAxis fontSize={11} stroke="var(--muted-foreground)" />
                <Tooltip formatter={(v: number) => inr(v)} />
                <Area
                  type="monotone"
                  dataKey="sales"
                  stroke="var(--primary)"
                  fill="var(--primary)"
                  fillOpacity={0.15}
                  strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Panel>
        <Panel>
          <h2 className="mb-4 font-semibold">Orders by Status</h2>
          <div className="h-64">
            {byStatus.length === 0 ? (
              <p className="pt-20 text-center text-sm text-muted-foreground">No orders yet</p>
            ) : (
              <ResponsiveContainer>
                <PieChart>
                  <Pie
                    data={byStatus}
                    dataKey="value"
                    nameKey="name"
                    innerRadius={50}
                    outerRadius={90}
                    paddingAngle={2}
                  >
                    {byStatus.map((_, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </Panel>
      </div>
      <div className="mt-6 grid gap-6 xl:grid-cols-3">
        <Panel>
          <h2 className="mb-4 font-semibold">Products by Category</h2>
          <div className="h-64">
            <ResponsiveContainer>
              <BarChart data={byCat} layout="vertical" margin={{ left: 20 }}>
                <XAxis
                  type="number"
                  allowDecimals={false}
                  fontSize={11}
                  stroke="var(--muted-foreground)"
                />
                <YAxis
                  type="category"
                  dataKey="name"
                  fontSize={11}
                  width={80}
                  stroke="var(--muted-foreground)"
                />
                <Tooltip />
                <Bar dataKey="count" fill="var(--chart-2)" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Panel>
        <Panel className="overflow-x-auto xl:col-span-2">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-semibold">Recent Orders</h2>
            <Link to="/admin/orders" className="text-sm text-primary">
              View all
            </Link>
          </div>
          <table className="w-full text-sm">
            <thead className="text-left text-xs text-muted-foreground">
              <tr>
                <th className="pb-2">Order</th>
                <th>Customer</th>
                <th>Date</th>
                <th>Total</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {orders.slice(0, 6).map((o) => (
                <tr key={o.id} className="border-t">
                  <td className="py-2.5">
                    <Link
                      to="/admin/orders/$id"
                      params={{ id: o.id }}
                      className="font-mono font-semibold text-primary"
                    >
                      #{o.id.slice(0, 8).toUpperCase()}
                    </Link>
                  </td>
                  <td>{(o.shipping_address as Ship).full_name}</td>
                  <td>{new Date(o.created_at).toLocaleDateString("en-IN")}</td>
                  <td>{inr(Number(o.total_amount))}</td>
                  <td>
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs font-semibold ${statusTone(o.status)}`}
                    >
                      {statusLabel(o.status)}
                    </span>
                  </td>
                </tr>
              ))}
              {orders.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-6 text-center text-muted-foreground">
                    No orders yet
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </Panel>
      </div>
    </div>
  );
}
