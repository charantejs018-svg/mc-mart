import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { PageHeader } from "@/components/admin/bits";
import { ProductForm } from "@/components/admin/ProductForm";
import { supabase } from "@/integrations/supabase/client";
import { useProducts } from "@/lib/shop";

export const Route = createFileRoute("/_authenticated/admin/products/edit/$id")({
  head: () => ({ meta: [{ title: "Edit Product — ShopKart Admin" }, { name: "description", content: "Edit a ShopKart product." }, { property: "og:title", content: "Edit Product — ShopKart Admin" }, { property: "og:description", content: "Edit a product." }] }),
  component: EditProduct,
});

function EditProduct() {
  const { id } = Route.useParams();
  const { data: products, isLoading } = useProducts();
  const p = products?.find((x) => x.id === id);
  const navigate = useNavigate();
  const qc = useQueryClient();
  if (isLoading) return <p className="text-muted-foreground">Loading…</p>;
  if (!p) return <p>Product not found.</p>;
  return (
    <div>
      <PageHeader title="Edit Product" sub={p.name} />
      <ProductForm
        initial={p}
        submitLabel="Save changes"
        onSubmit={async (v) => {
          const { error } = await supabase.from("products").update(v).eq("id", id);
          if (error) return void toast.error(error.message);
          qc.invalidateQueries({ queryKey: ["products"] });
          toast.success("Product updated");
          navigate({ to: "/admin/products" });
        }}
      />
    </div>
  );
}
