import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { PageHeader, Panel, useAllUsers } from "@/components/admin/bits";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";

export const Route = createFileRoute("/_authenticated/admin/users")({
  head: () => ({ meta: [{ title: "Users — ShopKart Admin" }, { name: "description", content: "View ShopKart customers and admins." }, { property: "og:title", content: "Users — ShopKart Admin" }, { property: "og:description", content: "View users." }] }),
  component: AdminUsers,
});

function AdminUsers() {
  const { data: users = [], isLoading } = useAllUsers();
  const { user: me } = useAuth();
  const [q, setQ] = useState("");
  const [role, setRole] = useState("");
  const qc = useQueryClient();

  const list = useMemo(
    () =>
      users.filter(
        (u) =>
          `${u.full_name ?? ""} ${u.email ?? ""} ${u.phone ?? ""}`.toLowerCase().includes(q.toLowerCase()) &&
          (!role || (role === "admin" ? u.isAdmin : !u.isAdmin)),
      ),
    [users, q, role],
  );

  const toggleAdmin = async (id: string, makeAdmin: boolean) => {
    const { error } = await supabase.rpc("admin_set_role", { _user: id, _role: "admin", _grant: makeAdmin });
    if (error) { toast.error(error.message); return; }
    toast.success(makeAdmin ? "Admin role granted" : "Admin role removed");
    qc.invalidateQueries({ queryKey: ["admin-users"] });
  };

  return (
    <div>
      <PageHeader title="Users" sub={`${users.length} registered users`} />
      <Panel>
        <div className="mb-4 flex flex-wrap gap-3">
          <div className="relative min-w-52 flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input className="pl-9" placeholder="Search name, email or phone…" value={q} onChange={(e) => setQ(e.target.value)} />
          </div>
          <select value={role} onChange={(e) => setRole(e.target.value)} className="h-9 rounded-md border bg-card px-3 text-sm">
            <option value="">All roles</option><option value="user">User</option><option value="admin">Admin</option>
          </select>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[820px] text-sm">
            <thead className="text-left text-xs uppercase text-muted-foreground"><tr><th className="pb-3">User ID</th><th>Name</th><th>Email</th><th>Phone</th><th>Role</th><th>Registered</th><th className="text-right">Actions</th></tr></thead>
            <tbody>
              {isLoading && <tr><td colSpan={7} className="py-6 text-center text-muted-foreground">Loading…</td></tr>}
              {list.map((u) => (
                <tr key={u.id} className="border-t">
                  <td className="py-3 font-mono text-xs">{u.id.slice(0, 8)}</td>
                  <td className="font-medium">{u.full_name || "—"}</td>
                  <td className="text-muted-foreground">{u.email}</td>
                  <td>{u.phone || "—"}</td>
                  <td>
                    <span className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${u.isAdmin ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}>
                      {u.isAdmin ? "ADMIN" : "USER"}
                    </span>
                  </td>
                  <td>{new Date(u.created_at).toLocaleDateString("en-IN")}</td>
                  <td className="text-right">
                    {u.id !== me?.id && (
                      <Button size="sm" variant="outline" onClick={() => toggleAdmin(u.id, !u.isAdmin)}>
                        {u.isAdmin ? "Remove admin" : "Make admin"}
                      </Button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Panel>
    </div>
  );
}
