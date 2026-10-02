import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Star, Minus, Plus } from "lucide-react";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { StoreShell } from "@/components/store/StoreShell";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth";
import { addToCart, finalPrice, inr, useProducts } from "@/lib/shop";

export const Route = createFileRoute("/products/$id")({
  head: () => ({
    meta: [
      { title: "Product details — ShopKart" },
      { name: "description", content: "View product details, price, rating and availability on ShopKart." },
      { property: "og:title", content: "Product details — ShopKart" },
      { property: "og:description", content: "Product details, price and availability." },
    ],
  }),
  component: ProductDetail,
});

function ProductDetail() {
  const { id } = Route.useParams();
  const { data: products, isLoading } = useProducts();
  const p = products?.find((x) => x.id === id);
  const [qty, setQty] = useState(1);
  const { user } = useAuth();
  const navigate = useNavigate();
  const qc = useQueryClient();

  if (isLoading) return <StoreShell><p className="p-10 text-center text-muted-foreground">Loading…</p></StoreShell>;
  if (!p)
    return (
      <StoreShell>
        <div className="p-16 text-center">
          <h1 className="text-2xl font-bold">Product not found</h1>
          <Link to="/products" className="mt-4 inline-block text-primary">Back to shop</Link>
        </div>
      </StoreShell>
    );

  const price = finalPrice({ price: Number(p.price), discount: Number(p.discount) });

  const add = async (buyNow: boolean) => {
    if (!user) { navigate({ to: "/auth" }); return; }
    try {
      await addToCart(user.id, p.id, qty);
      await qc.invalidateQueries({ queryKey: ["cart"] });
      if (buyNow) navigate({ to: "/checkout" });
      else toast.success("Added to cart");
    } catch (e) {
      toast.error((e as Error).message);
    }
  };

  return (
    <StoreShell>
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-10 md:grid-cols-2">
        <div className="overflow-hidden rounded-3xl border bg-muted">
          {p.image_url && <img src={p.image_url} alt={p.name} className="aspect-square w-full object-cover" />}
        </div>
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-primary">{p.categories?.name}</p>
          <h1 className="mt-2 text-3xl font-extrabold sm:text-4xl">{p.name}</h1>
          <div className="mt-3 flex items-center gap-1 text-sm">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star key={i} className={`h-4 w-4 ${i < Math.round(Number(p.rating)) ? "fill-warning text-warning" : "text-border"}`} />
            ))}
            <span className="ml-1 text-muted-foreground">{Number(p.rating).toFixed(1)}</span>
          </div>
          <div className="mt-6 flex items-baseline gap-3">
            <span className="font-display text-4xl font-bold">{inr(price)}</span>
            {Number(p.discount) > 0 && (
              <>
                <span className="text-lg text-muted-foreground line-through">{inr(Number(p.price))}</span>
                <span className="rounded-full bg-primary/15 px-2 py-0.5 text-sm font-bold text-primary">{Number(p.discount)}% off</span>
              </>
            )}
          </div>
          <p className={`mt-2 text-sm font-semibold ${p.stock > 0 ? "text-success" : "text-destructive"}`}>
            {p.stock > 0 ? `In stock (${p.stock} available)` : "Out of stock"}
          </p>
          <p className="mt-6 leading-relaxed text-muted-foreground">{p.description}</p>
          <div className="mt-8 flex items-center gap-4">
            <div className="flex items-center rounded-full border">
              <button className="p-3" onClick={() => setQty((q) => Math.max(1, q - 1))} aria-label="Decrease"><Minus className="h-4 w-4" /></button>
              <span className="w-8 text-center font-semibold">{qty}</span>
              <button className="p-3" onClick={() => setQty((q) => Math.min(p.stock, q + 1))} aria-label="Increase"><Plus className="h-4 w-4" /></button>
            </div>
          </div>
          <div className="mt-6 flex flex-wrap gap-3">
            <Button size="lg" variant="outline" className="rounded-full" disabled={p.stock === 0} onClick={() => add(false)}>Add to Cart</Button>
            <Button size="lg" className="rounded-full" disabled={p.stock === 0} onClick={() => add(true)}>Buy Now</Button>
          </div>
        </div>
      </div>
    </StoreShell>
  );
}
