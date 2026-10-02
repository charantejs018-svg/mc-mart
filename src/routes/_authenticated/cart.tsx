import { createFileRoute, Link } from "@tanstack/react-router";
import { Minus, Plus, Trash2, ShoppingBag } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { StoreShell } from "@/components/store/StoreShell";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { finalPrice, inr } from "@/lib/shop";
import { Summary, useCartTotals } from "@/components/store/order-bits";

export const Route = createFileRoute("/_authenticated/cart")({
  head: () => ({
    meta: [
      { title: "Your Cart — ShopKart" },
      { name: "description", content: "Review items in your ShopKart cart." },
      { property: "og:title", content: "Your Cart — ShopKart" },
      { property: "og:description", content: "Review items in your cart." },
    ],
  }),
  component: CartPage,
});

function CartPage() {
  const { user } = useAuth();
  const t = useCartTotals(user?.id);
  const qc = useQueryClient();

  const setQty = async (id: string, q: number, stock: number) => {
    if (q < 1) return;
    if (q > stock) {
      toast.error("Not enough stock");
      return;
    }
    const { error } = await supabase.from("cart_items").update({ quantity: q }).eq("id", id);
    if (error) toast.error(error.message);
    qc.invalidateQueries({ queryKey: ["cart"] });
  };
  const remove = async (id: string) => {
    const { error } = await supabase.from("cart_items").delete().eq("id", id);
    if (error) toast.error(error.message);
    qc.invalidateQueries({ queryKey: ["cart"] });
  };

  return (
    <StoreShell>
      <div className="mx-auto max-w-6xl px-4 py-10">
        <h1 className="text-3xl font-bold">Your cart</h1>
        {t.isLoading ? (
          <p className="mt-6 text-muted-foreground">Loading…</p>
        ) : t.items.length === 0 ? (
          <div className="mt-8 rounded-3xl border bg-card p-14 text-center">
            <ShoppingBag className="mx-auto h-12 w-12 text-muted-foreground" />
            <p className="mt-4 text-lg font-semibold">Your cart is empty</p>
            <Button asChild className="mt-6 rounded-full">
              <Link to="/products">Start shopping</Link>
            </Button>
          </div>
        ) : (
          <div className="mt-6 grid gap-8 lg:grid-cols-[1fr_340px]">
            <ul className="space-y-3">
              {t.items.map((c) => {
                const fp = finalPrice({
                  price: Number(c.products.price),
                  discount: Number(c.products.discount),
                });
                return (
                  <li key={c.id} className="flex gap-4 rounded-2xl border bg-card p-4">
                    <img
                      src={c.products.image_url ?? ""}
                      alt={c.products.name}
                      className="h-24 w-24 rounded-xl object-cover"
                    />
                    <div className="flex flex-1 flex-col">
                      <Link
                        to="/products/$id"
                        params={{ id: c.product_id }}
                        className="font-semibold hover:text-primary"
                      >
                        {c.products.name}
                      </Link>
                      <p className="text-sm text-muted-foreground">{inr(fp)} each</p>
                      <div className="mt-auto flex items-center justify-between">
                        <div className="flex items-center rounded-full border">
                          <button
                            className="p-2"
                            onClick={() => setQty(c.id, c.quantity - 1, c.products.stock)}
                            aria-label="Decrease"
                          >
                            <Minus className="h-3.5 w-3.5" />
                          </button>
                          <span className="w-7 text-center text-sm font-semibold">
                            {c.quantity}
                          </span>
                          <button
                            className="p-2"
                            onClick={() => setQty(c.id, c.quantity + 1, c.products.stock)}
                            aria-label="Increase"
                          >
                            <Plus className="h-3.5 w-3.5" />
                          </button>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="font-bold">{inr(fp * c.quantity)}</span>
                          <button
                            onClick={() => remove(c.id)}
                            className="text-muted-foreground hover:text-destructive"
                            aria-label="Remove"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
            <aside className="h-fit rounded-2xl border bg-card p-5">
              <h2 className="mb-4 text-lg font-bold">Order summary</h2>
              <Summary t={t} />
              <Button asChild size="lg" className="mt-5 w-full rounded-full">
                <Link to="/checkout">Proceed to checkout</Link>
              </Button>
            </aside>
          </div>
        )}
      </div>
    </StoreShell>
  );
}
