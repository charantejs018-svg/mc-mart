import { useState, type FormEvent } from "react";
import { Link } from "@tanstack/react-router";
import { z } from "zod";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useCategories, type Product } from "@/lib/shop";

export const productSchema = z.object({
  name: z.string().trim().min(2, "Product name is required").max(120),
  description: z.string().trim().min(5, "Description is required").max(2000),
  category_id: z.string().uuid("Select a category"),
  price: z.coerce.number().positive("Price must be greater than 0"),
  discount: z.coerce.number().min(0).max(100, "Discount must be 0–100"),
  stock: z.coerce.number().int("Stock must be a whole number").min(0),
  image_url: z.string().trim().url("Enter a valid image URL").max(1000),
  rating: z.coerce.number().min(0).max(5, "Rating must be 0–5"),
});
export type ProductInput = z.infer<typeof productSchema>;

export function ProductForm({ initial, submitLabel, onSubmit }: { initial?: Product; submitLabel: string; onSubmit: (v: ProductInput) => Promise<void> }) {
  const { data: categories } = useCategories();
  const [busy, setBusy] = useState(false);
  const [preview, setPreview] = useState(initial?.image_url ?? "");

  const submit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const parsed = productSchema.safeParse(Object.fromEntries(new FormData(e.currentTarget)));
    if (!parsed.success) return toast.error(parsed.error.issues[0].message);
    setBusy(true);
    try {
      await onSubmit(parsed.data);
    } finally {
      setBusy(false);
    }
  };

  return (
    <form onSubmit={submit} className="grid gap-6 lg:grid-cols-[1fr_280px]">
      <div className="grid gap-4 rounded-xl border bg-card p-6 sm:grid-cols-2">
        <div className="space-y-1.5 sm:col-span-2"><Label htmlFor="name">Product name *</Label><Input id="name" name="name" defaultValue={initial?.name} required /></div>
        <div className="space-y-1.5 sm:col-span-2"><Label htmlFor="description">Description *</Label><Textarea id="description" name="description" rows={4} defaultValue={initial?.description ?? ""} required /></div>
        <div className="space-y-1.5">
          <Label htmlFor="category_id">Category *</Label>
          <select id="category_id" name="category_id" defaultValue={initial?.category_id ?? ""} required className="h-9 w-full rounded-md border bg-card px-3 text-sm">
            <option value="" disabled>Select…</option>
            {categories?.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>
        <div className="space-y-1.5"><Label htmlFor="price">Price (₹) *</Label><Input id="price" name="price" type="number" step="0.01" min="0" defaultValue={initial?.price} required /></div>
        <div className="space-y-1.5"><Label htmlFor="discount">Discount (%)</Label><Input id="discount" name="discount" type="number" step="0.01" min="0" max="100" defaultValue={initial?.discount ?? 0} /></div>
        <div className="space-y-1.5"><Label htmlFor="stock">Stock quantity *</Label><Input id="stock" name="stock" type="number" min="0" defaultValue={initial?.stock ?? 0} required /></div>
        <div className="space-y-1.5"><Label htmlFor="rating">Rating (0–5)</Label><Input id="rating" name="rating" type="number" step="0.1" min="0" max="5" defaultValue={initial?.rating ?? 0} /></div>
        <div className="space-y-1.5 sm:col-span-2"><Label htmlFor="image_url">Product image URL *</Label><Input id="image_url" name="image_url" type="url" defaultValue={initial?.image_url ?? ""} onChange={(e) => setPreview(e.target.value)} required /></div>
        <div className="flex gap-3 sm:col-span-2">
          <Button type="submit" disabled={busy}>{busy ? "Saving…" : submitLabel}</Button>
          <Button type="button" variant="outline" asChild><Link to="/admin/products">Cancel</Link></Button>
        </div>
      </div>
      <div className="h-fit rounded-xl border bg-card p-4">
        <p className="mb-2 text-sm font-semibold">Image preview</p>
        <div className="aspect-square overflow-hidden rounded-lg bg-muted">
          {preview && <img src={preview} alt="Preview" className="h-full w-full object-cover" />}
        </div>
      </div>
    </form>
  );
}
