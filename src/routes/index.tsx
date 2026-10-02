import { createFileRoute, Link } from "@tanstack/react-router";
import { Truck, ShieldCheck, RotateCcw, ArrowRight } from "lucide-react";
import { StoreShell } from "@/components/store/StoreShell";
import { ProductCard } from "@/components/store/ProductCard";
import { useCategories, useProducts } from "@/lib/shop";
import hero from "@/assets/hero.jpg";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "ShopKart — Smartphones, Laptops, Fashion & More" },
      { name: "description", content: "Discover deals on smartphones, laptops, cameras, footwear and accessories at ShopKart." },
      { property: "og:title", content: "ShopKart — Shop the best deals" },
      { property: "og:description", content: "Deals on phones, laptops, cameras, footwear and accessories." },
    ],
  }),
  component: Home,
});

function Home() {
  const { data: products } = useProducts();
  const { data: categories } = useCategories();
  const featured = [...(products ?? [])].sort((a, b) => Number(b.rating) - Number(a.rating)).slice(0, 8);
  const deals = [...(products ?? [])].sort((a, b) => Number(b.discount) - Number(a.discount)).slice(0, 4);

  return (
    <StoreShell>
      <section className="mx-auto max-w-7xl px-4 pt-6">
        <div className="relative overflow-hidden rounded-3xl bg-secondary text-secondary-foreground">
          <img src={hero} alt="" className="absolute inset-0 h-full w-full object-cover opacity-60" />
          <div className="absolute inset-0 bg-gradient-to-r from-secondary via-secondary/80 to-transparent" />
          <div className="relative max-w-xl px-8 py-16 sm:px-12 sm:py-24">
            <span className="inline-block rounded-full bg-primary px-3 py-1 text-xs font-bold uppercase tracking-wider text-primary-foreground">
              Festive sale · up to 30% off
            </span>
            <h1 className="mt-5 text-4xl font-extrabold leading-[1.05] sm:text-6xl">Upgrade everything you carry.</h1>
            <p className="mt-4 text-lg opacity-80">Phones, laptops, cameras and everyday gear — delivered to your door.</p>
            <Link
              to="/products"
              className="mt-8 inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 font-semibold text-primary-foreground transition hover:gap-3"
            >
              Shop now <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      <section className="mx-auto mt-8 grid max-w-7xl gap-3 px-4 sm:grid-cols-3">
        {[
          { i: Truck, t: "Free delivery", d: "On orders above ₹999" },
          { i: ShieldCheck, t: "Secure checkout", d: "COD, UPI and cards" },
          { i: RotateCcw, t: "Easy returns", d: "7-day hassle-free" },
        ].map(({ i: Icon, t, d }) => (
          <div key={t} className="flex items-center gap-4 rounded-2xl border bg-card p-4">
            <div className="grid h-11 w-11 place-items-center rounded-xl bg-accent text-accent-foreground"><Icon className="h-5 w-5" /></div>
            <div><p className="font-semibold">{t}</p><p className="text-sm text-muted-foreground">{d}</p></div>
          </div>
        ))}
      </section>

      <section className="mx-auto mt-14 max-w-7xl px-4">
        <h2 className="text-2xl font-bold sm:text-3xl">Shop by category</h2>
        <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-7">
          {categories?.map((c) => (
            <Link
              key={c.id}
              to="/products"
              search={{ category: c.id }}
              className="rounded-2xl border bg-card px-4 py-6 text-center font-semibold transition hover:-translate-y-0.5 hover:border-primary hover:text-primary"
            >
              {c.name}
            </Link>
          ))}
        </div>
      </section>

      <section className="mx-auto mt-14 max-w-7xl px-4">
        <div className="flex items-end justify-between">
          <h2 className="text-2xl font-bold sm:text-3xl">Featured products</h2>
          <Link to="/products" className="text-sm font-semibold text-primary">View all →</Link>
        </div>
        <div className="mt-5 grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
          {featured.map((p) => <ProductCard key={p.id} p={p} />)}
        </div>
      </section>

      <section className="mx-auto mt-14 max-w-7xl px-4">
        <div className="rounded-3xl bg-accent p-6 sm:p-10">
          <h2 className="text-2xl font-bold sm:text-3xl">Today's biggest offers</h2>
          <p className="text-muted-foreground">Limited stock — grab them before they're gone.</p>
          <div className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
            {deals.map((p) => <ProductCard key={p.id} p={p} />)}
          </div>
        </div>
      </section>
    </StoreShell>
  );
}
