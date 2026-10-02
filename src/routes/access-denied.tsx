import { createFileRoute, Link } from "@tanstack/react-router";
import { ShieldX } from "lucide-react";

export const Route = createFileRoute("/access-denied")({
  head: () => ({
    meta: [
      { title: "Access Denied — ShopKart" },
      { name: "description", content: "You don't have permission to view this page." },
      { property: "og:title", content: "Access Denied — ShopKart" },
      { property: "og:description", content: "You don't have permission to view this page." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: () => (
    <div className="grid min-h-screen place-items-center px-4 text-center">
      <div>
        <ShieldX className="mx-auto h-14 w-14 text-destructive" />
        <h1 className="mt-4 text-3xl font-bold">Access Denied</h1>
        <p className="mt-2 text-muted-foreground">
          The admin panel is only available to administrators.
        </p>
        <Link
          to="/"
          className="mt-6 inline-block rounded-full bg-primary px-5 py-2.5 font-semibold text-primary-foreground"
        >
          Back to store
        </Link>
      </div>
    </div>
  ),
});
