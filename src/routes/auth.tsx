import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { AuthForm } from "@/components/AuthForm";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Login or Register — ShopKart" },
      { name: "description", content: "Sign in to your ShopKart account or create a new one." },
      { property: "og:title", content: "Login — ShopKart" },
      { property: "og:description", content: "Sign in or create your ShopKart account." },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const navigate = useNavigate();
  return (
    <div className="grid min-h-screen place-items-center bg-muted px-4">
      <div className="w-full max-w-md">
        <Link to="/" className="mb-6 block text-center font-display text-3xl font-extrabold">
          Shop<span className="text-primary">Kart</span>
        </Link>
        <AuthForm allowRegister onDone={(isAdmin) => navigate({ to: isAdmin ? "/admin" : "/" })} />
        <p className="mt-4 text-center text-sm text-muted-foreground">
          Store admin?{" "}
          <Link to="/admin-login" className="font-semibold text-primary">
            Admin login
          </Link>
        </p>
      </div>
    </div>
  );
}
