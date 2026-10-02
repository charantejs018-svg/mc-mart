import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Pencil, Trash2, Plus, Search } from "lucide-react";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { PageHeader, Panel } from "@/components/admin/bits";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription,
  AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { supabase } from "@/integrations/supabase/client";
import { finalPrice, inr, useCategories, useProducts, type Product } from "@/lib/shop";

export const Route = createFileRoute("/_authenticated/admin/products/")({
  head: () => ({ meta: [{ title: "Products — ShopKart Admin" }, { name: "description", content: "Manage ShopKart products." }, { property: "og:title", content: "Products — ShopKart Admin" }, { property: "og:description", content: "Manage products." }] }),
  component: AdminProducts,
});

function AdminProducts() {
  const { data: products = [], isLoading } = useProducts();
  const { data: categories = [] } = useCategories();
  const [q, setQ] = useState("");
  const [cat, setCat] = useState("");
  const [stockF, setStockF] = useState("");
  const [toDelete, setToDelete] = useState<Product | null>(null);
  const qc = useQueryClient();

  const list = useMemo(
    () =>
      products.filter(
        (p) =>
          p.name.toLowerCase().includes(q.toLowerCase()) &&
          (!cat || p.category_id === cat) &&
          (!stockF || (stockF === "out" ? p.stock === 0 : stockF === "low" ? p.stock > 0 && p.stock <= 10 : p.stock > 10)),
      ),
    [products, q, cat, stockF],
  );

  const updateStock = async (p: Product, stock: number) => {
    if (!Number.isInteger(stock) || stock < 0) { toast.error("Invalid stock"); return; }
    const { error } = await supabase.from("products").update({ stock }).eq("id", p.id);
    if (error) { toast.error(error.message); return; }
    qc.invalidateQueries({ queryKey: ["products"] });
    toast.success(`Stock updated for ${p.name}`);
  };

  const doDelete = async () => {
    if (!toDelete) return;
    const { error } = await supabase.from("products").delete().eq("id", toDelete.id);
    if (error) toast.error(error.message);
    else toast.success("Product deleted");
    setToDelete(null);
    qc.invalidateQueries({ queryKey: ["products"] });
  };

  return (
    <div>
      <PageHeader title="Products" sub={`${products.length} products in catalog`} action={<Button asChild><Link to="/admin/products/add"><Plus className="mr-1 h-4 w-4" />Add Product</Link></Button>} />
      <Panel>
        <div className="mb-4 flex flex-wrap gap-3">
          <div className="relative min-w-52 flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input className="pl-9" placeholder="Search products…" value={q} onChange={(e) => setQ(e.target.value)} />
          </div>
          <select value={cat} onChange={(e) => setCat(e.target.value)} className="h-9 rounded-md border bg-card px-3 text-sm">
            <option value="">All categories</option>
            {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
          <select value={stockF} onChange={(e) => setStockF(e.target.value)} className="h-9 rounded-md border bg-card px-3 text-sm">
            <option value="">All stock</option><option value="in">In stock (&gt;10)</option><option value="low">Low (1–10)</option><option value="out">Out of stock</option>
          </select>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] text-sm">
            <thead className="text-left text-xs uppercase text-muted-foreground">
              <tr><th className="pb-3">Product</th><th>Category</th><th>Price</th><th>Discount</th><th>Final</th><th>Stock</th><th>Rating</th><th className="text-right">Actions</th></tr>
            </thead>
            <tbody>
              {isLoading && <tr><td colSpan={8} className="py-6 text-center text-muted-foreground">Loading…</td></tr>}
              {list.map((p) => (
                <tr key={p.id} className="border-t">
                  <td className="py-3">
                    <div className="flex items-center gap-3">
                      <img src={p.image_url ?? ""} alt="" className="h-10 w-10 rounded-md object-cover" />
                      <span className="font-medium">{p.name}</span>
                    </div>
                  </td>
                  <td>{p.categories?.name ?? "—"}</td>
                  <td>{inr(Number(p.price))}</td>
                  <td>{Number(p.discount)}%</td>
                  <td className="font-semibold">{inr(finalPrice({ price: Number(p.price), discount: Number(p.discount) }))}</td>
                  <td>
                    <Input
                      type="number"
                      min={0}
                      defaultValue={p.stock}
                      key={p.stock}
                      className={`h-8 w-20 ${p.stock === 0 ? "border-destructive text-destructive" : p.stock <= 10 ? "border-warning" : ""}`}
                      onBlur={(e) => Number(e.target.value) !== p.stock && updateStock(p, Number(e.target.value))}
                    />
                  </td>
                  <td>{Number(p.rating).toFixed(1)}</td>
                  <td className="text-right">
                    <Button asChild size="icon" variant="ghost"><Link to="/admin/products/edit/$id" params={{ id: p.id }} aria-label="Edit"><Pencil className="h-4 w-4" /></Link></Button>
                    <Button size="icon" variant="ghost" onClick={() => setToDelete(p)} aria-label="Delete"><Trash2 className="h-4 w-4 text-destructive" /></Button>
                  </td>
                </tr>
              ))}
              {!isLoading && list.length === 0 && <tr><td colSpan={8} className="py-6 text-center text-muted-foreground">No products found</td></tr>}
            </tbody>
          </table>
        </div>
      </Panel>
      <AlertDialog open={!!toDelete} onOpenChange={(o) => !o && setToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete "{toDelete?.name}"?</AlertDialogTitle>
            <AlertDialogDescription>This permanently removes the product from the catalog. This cannot be undone.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={doDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
