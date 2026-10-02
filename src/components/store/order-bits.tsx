import { useQuery } from "@tanstack/react-query";
import { Check, XCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { deliveryFee, finalPrice, inr, ORDER_STEPS, useCart, useRealtime } from "@/lib/shop";

export function useCartTotals(userId?: string) {
  const { data: cart, isLoading } = useCart(userId);
  const items = cart ?? [];
  const mrp = items.reduce((s, c) => s + Number(c.products.price) * c.quantity, 0);
  const subtotal = items.reduce(
    (s, c) =>
      s +
      finalPrice({ price: Number(c.products.price), discount: Number(c.products.discount) }) *
        c.quantity,
    0,
  );
  const fee = deliveryFee(subtotal);
  return { items, isLoading, mrp, discount: mrp - subtotal, subtotal, fee, total: subtotal + fee };
}

export function Summary({ t }: { t: ReturnType<typeof useCartTotals> }) {
  const row = "flex justify-between text-sm";
  return (
    <div className="space-y-2">
      <div className={row}>
        <span>Price (MRP)</span>
        <span>{inr(t.mrp)}</span>
      </div>
      <div className={`${row} text-success`}>
        <span>Discount</span>
        <span>−{inr(t.discount)}</span>
      </div>
      <div className={row}>
        <span>Subtotal</span>
        <span>{inr(t.subtotal)}</span>
      </div>
      <div className={row}>
        <span>Delivery fee</span>
        <span>{t.fee === 0 ? "FREE" : inr(t.fee)}</span>
      </div>
      <div className="flex justify-between border-t pt-3 font-display text-lg font-bold">
        <span>Total</span>
        <span>{inr(t.total)}</span>
      </div>
    </div>
  );
}

export function useOrder(id: string) {
  useRealtime("orders", [["orders"]]);
  return useQuery({
    queryKey: ["orders", "one", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("orders")
        .select("*, order_items(*)")
        .eq("id", id)
        .maybeSingle();
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
              {i > 0 && (
                <span
                  className={`absolute right-1/2 hidden h-1 w-full -translate-y-0 sm:block ${i <= idx ? "bg-primary" : "bg-border"}`}
                />
              )}
              <span
                className={`relative z-10 grid h-10 w-10 shrink-0 place-items-center rounded-full border-2 font-bold ${done ? "border-primary bg-primary text-primary-foreground" : "border-border bg-card text-muted-foreground"} ${current ? "ring-4 ring-primary/25" : ""}`}
              >
                {done ? <Check className="h-5 w-5" /> : i + 1}
              </span>
            </div>
            <span
              className={`text-sm ${current ? "font-bold text-primary" : done ? "font-semibold" : "text-muted-foreground"}`}
            >
              {s.label}
            </span>
          </li>
        );
      })}
    </ol>
  );
}
