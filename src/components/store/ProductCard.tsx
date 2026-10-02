import { Link, useNavigate } from "@tanstack/react-router";
import { Star, Plus } from "lucide-react";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/lib/auth";
import { addToCart, finalPrice, inr, type Product } from "@/lib/shop";

export function ProductCard({ p }: { p: Product }) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const price = finalPrice({ price: Number(p.price), discount: Number(p.discount) });

  const add = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (!user) { navigate({ to: "/auth" }); return; }
    try {
      await addToCart(user.id, p.id, 1);
      qc.invalidateQueries({ queryKey: ["cart"] });
      toast.success(`${p.name} added to cart`);
    } catch (err) {
      toast.error((err as Error).message);
    }
  };

  return (
    <Link
      to="/products/$id"
      params={{ id: p.id }}
      className="group flex flex-col overflow-hidden rounded-2xl border bg-card transition duration-300 hover:-translate-y-1 hover:shadow-xl"
    >
      <div className="relative aspect-square overflow-hidden bg-muted">
        {p.image_url && (
          <img src={p.image_url} alt={p.name} loading="lazy" className="h-full w-full object-cover transition duration-500 group-hover:scale-105" />
        )}
        {Number(p.discount) > 0 && (
          <span className="absolute left-3 top-3 rounded-full bg-primary px-2.5 py-1 text-xs font-bold text-primary-foreground">
            -{Number(p.discount)}%
          </span>
        )}
        {p.stock === 0 && (
          <span className="absolute inset-0 grid place-items-center bg-background/70 font-semibold">Out of stock</span>
        )}
      </div>
      <div className="flex flex-1 flex-col p-4">
        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{p.categories?.name}</p>
        <h3 className="mt-1 line-clamp-1 font-semibold">{p.name}</h3>
        <div className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
          <Star className="h-3.5 w-3.5 fill-warning text-warning" /> {Number(p.rating).toFixed(1)}
        </div>
        <div className="mt-auto flex items-end justify-between pt-3">
          <div>
            <p className="font-display text-lg font-bold">{inr(price)}</p>
            {Number(p.discount) > 0 && <p className="text-xs text-muted-foreground line-through">{inr(Number(p.price))}</p>}
          </div>
          <button
            onClick={add}
            disabled={p.stock === 0}
            aria-label="Add to cart"
            className="grid h-9 w-9 place-items-center rounded-full bg-secondary text-secondary-foreground transition hover:bg-primary disabled:opacity-40"
          >
            <Plus className="h-4 w-4" />
          </button>
        </div>
      </div>
    </Link>
  );
}
