import { createFileRoute } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { Pencil, Trash2, Plus } from "lucide-react";
import { z } from "zod";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { PageHeader, Panel } from "@/components/admin/bits";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { supabase } from "@/integrations/supabase/client";
import { useCategories, useProducts, type Category } from "@/lib/shop";

export const Route = createFileRoute("/_authenticated/admin/categories")({
  head: () => ({
    meta: [
      { title: "Categories — ShopKart Admin" },
      { name: "description", content: "Manage ShopKart categories." },
      { property: "og:title", content: "Categories — ShopKart Admin" },
      { property: "og:description", content: "Manage categories." },
    ],
  }),
  component: Categories,
});

const schema = z.object({
  name: z.string().trim().min(2, "Name is required").max(60),
  description: z.string().trim().max(300),
});

function Categories() {
  const { data: categories = [] } = useCategories();
  const { data: products = [] } = useProducts();
  const [editing, setEditing] = useState<Category | "new" | null>(null);
  const [toDelete, setToDelete] = useState<Category | null>(null);
  const qc = useQueryClient();

  const save = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const parsed = schema.safeParse(Object.fromEntries(new FormData(e.currentTarget)));
    if (!parsed.success) {
      toast.error(parsed.error.issues[0]?.message ?? "Invalid input");
      return;
    }
    const { error } =
      editing === "new"
        ? await supabase.from("categories").insert(parsed.data)
        : await supabase
            .from("categories")
            .update(parsed.data)
            .eq("id", (editing as Category).id);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success(editing === "new" ? "Category added" : "Category updated");
    setEditing(null);
    qc.invalidateQueries({ queryKey: ["categories"] });
  };

  const del = async () => {
    if (!toDelete) return;
    const { error } = await supabase.from("categories").delete().eq("id", toDelete.id);
    if (error) toast.error(error.message);
    else toast.success("Category deleted");
    setToDelete(null);
    qc.invalidateQueries({ queryKey: ["categories"] });
    qc.invalidateQueries({ queryKey: ["products"] });
  };

  return (
    <div>
      <PageHeader
        title="Categories"
        sub="Shown as filters in the store"
        action={
          <Button onClick={() => setEditing("new")}>
            <Plus className="mr-1 h-4 w-4" />
            Add category
          </Button>
        }
      />
      <Panel className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="text-left text-xs uppercase text-muted-foreground">
            <tr>
              <th className="pb-3">Name</th>
              <th>Description</th>
              <th>Products</th>
              <th className="text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {categories.map((c) => (
              <tr key={c.id} className="border-t">
                <td className="py-3 font-medium">{c.name}</td>
                <td className="text-muted-foreground">{c.description}</td>
                <td>{products.filter((p) => p.category_id === c.id).length}</td>
                <td className="text-right">
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => setEditing(c)}
                    aria-label="Edit"
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => setToDelete(c)}
                    aria-label="Delete"
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Panel>
      <Dialog open={!!editing} onOpenChange={(o) => !o && setEditing(null)}>
        <DialogContent className="admin-theme">
          <DialogHeader>
            <DialogTitle>{editing === "new" ? "Add category" : "Edit category"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={save} className="space-y-4" key={editing === "new" ? "new" : editing?.id}>
            <div className="space-y-1.5">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                name="name"
                defaultValue={editing && editing !== "new" ? editing.name : ""}
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                name="description"
                defaultValue={editing && editing !== "new" ? (editing.description ?? "") : ""}
              />
            </div>
            <Button type="submit" className="w-full">
              Save
            </Button>
          </form>
        </DialogContent>
      </Dialog>
      <AlertDialog open={!!toDelete} onOpenChange={(o) => !o && setToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete "{toDelete?.name}"?</AlertDialogTitle>
            <AlertDialogDescription>
              Products in this category will become uncategorised.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={del}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
