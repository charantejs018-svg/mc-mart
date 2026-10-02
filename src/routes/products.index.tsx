import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useMemo } from "react";
import { StoreShell } from "@/components/store/StoreShell";
import { ProductCard } from "@/components/store/ProductCard";
import { finalPrice, useCategories, useProducts } from "@/lib/shop";

type Search = { q?: string; category?: string; min?: number; max?: number; sort?: string };

export const Route = createFileRoute("/products/")({
  validateSearch: (s: Record<string, unknown>): Search => ({
    q: typeof s.q === "string" ? s.q : undefined,
    category: typeof s.category === "string" ? s.category : undefined,
    min: s.min ? Number(s.min) : undefined,
    max: s.max ? Number(s.max) : undefined,
    sort: typeof s.sort === "string" ? s.sort : undefined,
  }),
  head: () => ({
    meta: [
      { title: "All Products — ShopKart" },
      { name: "description", content: "Browse and filter ShopKart's catalog of electronics, fashion, footwear and more." },
      { property: "og:title", content: "All Products — ShopKart" },
      { property: "og:description", content: "Browse electronics, fashion, footwear and accessories." },
    ],
  }),
  component: Products,
});

function Products() {
  const search = Route.useSearch();
  const navigate = useNavigate({ from: "/products/" });
  const { data: products, isLoading } = useProducts();
  const { data: categories } = useCategories();
  const set = (patch: Partial<Search>) => navigate({ search: (s) => ({ ...s, ...patch }) });

  const list = useMemo(() => {
    let l = products ?? [];
    if (search.q) {
      const q = search.q.toLowerCase();
      l = l.filter((p) => p.name.toLowerCase().includes(q) || (p.description ?? "").toLowerCase().includes(q));
    }
    if (search.category) l = l.filter((p) => p.category_id === search.category);
    const fp = (p: (typeof l)[number]) => finalPrice({ price: Number(p.price), discount: Number(p.discount) });
    if (search.min != null) l = l.filter((p) => fp(p) >= search.min!);
    if (search.max != null) l = l.filter((p) => fp(p) <= search.max!);
    const sorted = [...l];
    if (search.sort === "price_asc") sorted.sort((a, b) => fp(a) - fp(b));
    if (search.sort === "price_desc") sorted.sort((a, b) => fp(b) - fp(a));
    if (search.sort === "rating") sorted.sort((a, b) => Number(b.rating) - Number(a.rating));
    if (search.sort === "discount") sorted.sort((a, b) => Number(b.discount) - Number(a.discount));
    return sorted;
  }, [products, search]);

  const input = "w-full rounded-lg border bg-card px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring";

  return (
    <StoreShell>
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-8 lg:grid-cols-[240px_1fr]">
        <aside className="space-y-6">
          <div>
            <p className="mb-2 text-sm font-bold">Search</p>
            <input className={input} defaultValue={search.q} placeholder="Product name…" onChange={(e) => set({ q: e.target.value || undefined })} />
          </div>
          <div>
            <p className="mb-2 text-sm font-bold">Category</p>
            <div className="flex flex-wrap gap-2 lg:flex-col">
              <button onClick={() => set({ category: undefined })} className={`rounded-lg px-3 py-1.5 text-left text-sm ${!search.category ? "bg-primary text-primary-foreground" : "hover:bg-muted"}`}>All</button>
              {categories?.map((c) => (
                <button key={c.id} onClick={() => set({ category: c.id })} className={`rounded-lg px-3 py-1.5 text-left text-sm ${search.category === c.id ? "bg-primary text-primary-foreground" : "hover:bg-muted"}`}>
                  {c.name}
                </button>
              ))}
            </div>
          </div>
          <div>
            <p className="mb-2 text-sm font-bold">Price (₹)</p>
            <div className="flex gap-2">
              <input type="number" min={0} className={input} placeholder="Min" defaultValue={search.min} onChange={(e) => set({ min: e.target.value ? Number(e.target.value) : undefined })} />
              <input type="number" min={0} className={input} placeholder="Max" defaultValue={search.max} onChange={(e) => set({ max: e.target.value ? Number(e.target.value) : undefined })} />
            </div>
          </div>
        </aside>
        <section>
          <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
            <h1 className="text-2xl font-bold">{search.q ? `Results for "${search.q}"` : "All products"} <span className="text-base font-medium text-muted-foreground">({list.length})</span></h1>
            <select className="rounded-lg border bg-card px-3 py-2 text-sm" value={search.sort ?? ""} onChange={(e) => set({ sort: e.target.value || undefined })}>
              <option value="">Newest</option>
              <option value="price_asc">Price: low to high</option>
              <option value="price_desc">Price: high to low</option>
              <option value="rating">Top rated</option>
              <option value="discount">Biggest discount</option>
            </select>
          </div>
          {isLoading ? (
            <p className="text-muted-foreground">Loading products…</p>
          ) : list.length === 0 ? (
            <p className="rounded-2xl border bg-card p-10 text-center text-muted-foreground">No products match your filters.</p>
          ) : (
            <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-4">
              {list.map((p) => <ProductCard key={p.id} p={p} />)}
            </div>
          )}
        </section>
      </div>
    </StoreShell>
  );
}
