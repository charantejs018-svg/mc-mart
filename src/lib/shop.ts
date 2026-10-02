import { useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

export type Product = Database["public"]["Tables"]["products"]["Row"] & {
  categories?: { name: string } | null;
};
export type Category = Database["public"]["Tables"]["categories"]["Row"];
export type OrderStatus = Database["public"]["Enums"]["order_status"];

export const inr = (n: number) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(n);

export const finalPrice = (p: { price: number; discount: number }) =>
  Math.round(Number(p.price) * (1 - Number(p.discount) / 100) * 100) / 100;

export const deliveryFee = (subtotal: number) => (subtotal === 0 || subtotal >= 999 ? 0 : 49);

export const ORDER_STEPS: { key: OrderStatus; label: string }[] = [
  { key: "pending", label: "Order Placed" },
  { key: "confirmed", label: "Confirmed" },
  { key: "packed", label: "Packed" },
  { key: "shipped", label: "Shipped" },
  { key: "out_for_delivery", label: "Out for Delivery" },
  { key: "delivered", label: "Delivered" },
];
export const ALL_STATUSES: OrderStatus[] = [...ORDER_STEPS.map((s) => s.key), "cancelled"];
export const statusLabel = (s: OrderStatus) =>
  s === "cancelled" ? "Cancelled" : s === "pending" ? "Pending" : ORDER_STEPS.find((x) => x.key === s)!.label;
export const statusTone = (s: OrderStatus) =>
  s === "delivered"
    ? "bg-success/15 text-success"
    : s === "cancelled"
      ? "bg-destructive/15 text-destructive"
      : s === "pending"
        ? "bg-warning/25 text-foreground"
        : "bg-primary/15 text-primary";
export const paymentLabel = (m: string) => ({ cod: "Cash on Delivery", upi: "UPI", card: "Card" })[m] ?? m;

/** Subscribes to realtime changes on a table and invalidates the given query keys. */
export function useRealtime(table: "products" | "categories" | "orders", keys: string[][]) {
  const qc = useQueryClient();
  useEffect(() => {
    const ch = supabase
      .channel(`rt-${table}-${Math.random().toString(36).slice(2)}`)
      .on("postgres_changes", { event: "*", schema: "public", table }, () => {
        keys.forEach((k) => qc.invalidateQueries({ queryKey: k }));
      })
      .subscribe();
    return () => {
      supabase.removeChannel(ch);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [table]);
}

export function useCategories() {
  useRealtime("categories", [["categories"]]);
  return useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const { data, error } = await supabase.from("categories").select("*").order("name");
      if (error) throw error;
      return data as Category[];
    },
  });
}

export function useProducts() {
  useRealtime("products", [["products"]]);
  return useQuery({
    queryKey: ["products"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("products")
        .select("*, categories(name)")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as Product[];
    },
  });
}

export type CartRow = { id: string; quantity: number; product_id: string; products: Product };

export function useCart(userId: string | undefined) {
  return useQuery({
    queryKey: ["cart", userId],
    enabled: !!userId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("cart_items")
        .select("id, quantity, product_id, products(*)")
        .order("created_at");
      if (error) throw error;
      return data as unknown as CartRow[];
    },
  });
}

export async function addToCart(userId: string, productId: string, qty: number) {
  const { data: existing } = await supabase
    .from("cart_items")
    .select("id, quantity")
    .eq("product_id", productId)
    .maybeSingle();
  if (existing) {
    const { error } = await supabase
      .from("cart_items")
      .update({ quantity: existing.quantity + qty })
      .eq("id", existing.id);
    if (error) throw error;
  } else {
    const { error } = await supabase.from("cart_items").insert({ user_id: userId, product_id: productId, quantity: qty });
    if (error) throw error;
  }
}
