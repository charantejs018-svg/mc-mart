<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

## Architecture rules
- Roles live in `public.user_roles` and are checked via the `has_role()` SQL function — never store roles on profiles (prevents privilege escalation).
- Data access is client-side via the browser Supabase client with RLS as the security boundary; order placement goes through the `place_order` RPC so prices/stock are computed server-side.
- Admin routes live under `src/routes/_authenticated/admin/` with a role-checking `beforeLoad`; shared helpers for routes live in `src/components/*` (never export helpers from route files — code splitting strips them).
- Store prices: shared constants/helpers in `src/lib/shop.ts`; delivery-fee rule must match `place_order` SQL.
