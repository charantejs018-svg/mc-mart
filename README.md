# ShopKart

Full-stack e-commerce store with separate **User** and **Admin** roles.

## Creating the first Admin account

Normal registration always creates a `user` role — nobody can pick "admin" while signing up.

1. Register normally on `/auth` with the email you want to be admin, and confirm it.
2. Open the backend (Cloud → Database → SQL) and run:

```sql
insert into public.user_roles (user_id, role)
select id, 'admin' from auth.users where email = 'you@example.com'
on conflict do nothing;
```

3. Log in at `/admin-login` (or `/auth`) — you'll land on `/admin`.

After that, existing admins can promote/demote other users from **Admin → Users**.
