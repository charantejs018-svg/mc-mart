import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { PageHeader } from "@/components/admin/bits";
import { ProductForm } from "@/components/admin/ProductForm";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/_authenticated/admin/products/add")({
  head: () => ({ meta: [{ title: "Add Product — ShopKart Admin" }, { name: "description", content: "Add a new product to ShopKart." }, { property: "og:title", content: "Add Product — ShopKart Admin" }, { property: "og:description", content: "Add a product." }] }),
  component: AddProduct,
});

function AddProduct() {
  const navigate = useNavigate();
  const qc = useQueryClient();
  return (
    <div>
      <PageHeader title="Add Product" sub="New products appear in the store immediately" />
      <ProductForm
        submitLabel="Add Product"
        onSubmit={async (v) => {
          const { error } = await supabase.from("products").insert(v);
          if (error) return void toast.error(error.message);
          qc.invalidateQueries({ queryKey: ["products"] });
          toast.success("Product added successfully");
          navigate({ to: "/admin/products" });
        }}
      />
    </div>
  );
}
