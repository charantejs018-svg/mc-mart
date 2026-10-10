create type public.app_role as enum ('admin','user');
create type public.order_status as enum ('pending','confirmed','packed','shipped','out_for_delivery','delivered','cancelled');

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text, email text, phone text, address text,
  created_at timestamptz not null default now()
);
create table public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  role app_role not null, unique(user_id, role)
);
create table public.categories (
  id uuid primary key default gen_random_uuid(),
  name text not null unique, description text,
  created_at timestamptz not null default now()
);
create table public.products (
  id uuid primary key default gen_random_uuid(),
  name text not null, description text,
  category_id uuid references public.categories(id) on delete set null,
  price numeric(12,2) not null check (price >= 0),
  discount numeric(5,2) not null default 0 check (discount >= 0 and discount <= 100),
  stock int not null default 0 check (stock >= 0),
  image_url text, rating numeric(2,1) not null default 0 check (rating >= 0 and rating <= 5),
  created_at timestamptz not null default now()
);
create table public.cart_items (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  product_id uuid not null references public.products(id) on delete cascade,
  quantity int not null default 1 check (quantity > 0),
  created_at timestamptz not null default now(),
  unique(user_id, product_id)
);
create table public.orders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  total_amount numeric(12,2) not null,
  payment_method text not null,
  status order_status not null default 'pending',
  shipping_address jsonb not null,
  created_at timestamptz not null default now()
);
create table public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  product_id uuid references public.products(id) on delete set null,
  product_name text not null,
  quantity int not null check (quantity > 0),
  price numeric(12,2) not null
);

grant select, update on public.profiles to authenticated;
grant select on public.user_roles to authenticated;
grant select on public.categories, public.products to anon, authenticated;
grant insert, update, delete on public.categories, public.products to authenticated;
grant select, insert, update, delete on public.cart_items to authenticated;
grant select, update on public.orders to authenticated;
grant select on public.order_items to authenticated;
grant all on public.profiles, public.user_roles, public.categories, public.products, public.cart_items, public.orders, public.order_items to service_role;

alter table public.profiles enable row level security;
alter table public.user_roles enable row level security;
alter table public.categories enable row level security;
alter table public.products enable row level security;
alter table public.cart_items enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;

create or replace function public.has_role(_user_id uuid, _role app_role)
returns boolean language sql stable security definer set search_path = public
as $$ select exists (select 1 from public.user_roles where user_id = _user_id and role = _role) $$;

create policy "own profile read" on public.profiles for select to authenticated using (id = auth.uid() or public.has_role(auth.uid(),'admin'));
create policy "own profile update" on public.profiles for update to authenticated using (id = auth.uid()) with check (id = auth.uid());
create policy "roles read" on public.user_roles for select to authenticated using (user_id = auth.uid() or public.has_role(auth.uid(),'admin'));
create policy "categories public" on public.categories for select to anon, authenticated using (true);
create policy "categories admin write" on public.categories for all to authenticated using (public.has_role(auth.uid(),'admin')) with check (public.has_role(auth.uid(),'admin'));
create policy "products public" on public.products for select to anon, authenticated using (true);
create policy "products admin write" on public.products for all to authenticated using (public.has_role(auth.uid(),'admin')) with check (public.has_role(auth.uid(),'admin'));
create policy "own cart" on public.cart_items for all to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "orders read" on public.orders for select to authenticated using (user_id = auth.uid() or public.has_role(auth.uid(),'admin'));
create policy "orders admin update" on public.orders for update to authenticated using (public.has_role(auth.uid(),'admin')) with check (public.has_role(auth.uid(),'admin'));
create policy "order items read" on public.order_items for select to authenticated using (exists (select 1 from public.orders o where o.id = order_id and (o.user_id = auth.uid() or public.has_role(auth.uid(),'admin'))));

create or replace function public.handle_new_user() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles(id, full_name, email) values (new.id, new.raw_user_meta_data->>'full_name', new.email);
  insert into public.user_roles(user_id, role) values (new.id, 'user');
  return new;
end $$;
create trigger on_auth_user_created after insert on auth.users for each row execute function public.handle_new_user();

create or replace function public.place_order(_payment_method text, _shipping jsonb)
returns uuid language plpgsql security definer set search_path = public as $$
declare _uid uuid := auth.uid(); _order uuid; _sub numeric := 0; _fee numeric; r record;
begin
  if _uid is null then raise exception 'Not authenticated'; end if;
  if _payment_method not in ('cod','upi','card') then raise exception 'Invalid payment method'; end if;
  for r in select c.quantity, p.* from cart_items c join products p on p.id = c.product_id where c.user_id = _uid for update of p loop
    if r.stock < r.quantity then raise exception 'Insufficient stock for %', r.name; end if;
    _sub := _sub + round(r.price * (1 - r.discount/100), 2) * r.quantity;
  end loop;
  if _sub = 0 then raise exception 'Cart is empty'; end if;
  _fee := case when _sub >= 999 then 0 else 49 end;
  insert into orders(user_id, total_amount, payment_method, shipping_address) values (_uid, _sub + _fee, _payment_method, _shipping) returning id into _order;
  insert into order_items(order_id, product_id, product_name, quantity, price)
    select _order, p.id, p.name, c.quantity, round(p.price * (1 - p.discount/100), 2) from cart_items c join products p on p.id = c.product_id where c.user_id = _uid;
  update products p set stock = p.stock - c.quantity from cart_items c where c.product_id = p.id and c.user_id = _uid;
  delete from cart_items where user_id = _uid;
  return _order;
end $$;
revoke execute on function public.place_order(text, jsonb) from anon, public;
grant execute on function public.place_order(text, jsonb) to authenticated;

create or replace function public.admin_set_role(_user uuid, _role app_role, _grant boolean)
returns void language plpgsql security definer set search_path = public as $$
begin
  if not public.has_role(auth.uid(),'admin') then raise exception 'Forbidden'; end if;
  if _grant then insert into user_roles(user_id, role) values (_user, _role) on conflict do nothing;
  else delete from user_roles where user_id = _user and role = _role; end if;
end $$;
revoke execute on function public.admin_set_role(uuid, app_role, boolean) from anon, public;
grant execute on function public.admin_set_role(uuid, app_role, boolean) to authenticated;

alter publication supabase_realtime add table public.products, public.orders, public.categories;

insert into public.categories(name, description) values
('Electronics','Gadgets and devices'),('Fashion','Clothing and apparel'),('Footwear','Shoes and sneakers'),
('Accessories','Bags, watches and more'),('Smartphones','Latest mobile phones'),('Laptops','Notebooks and ultrabooks'),('Cameras','DSLR and mirrorless');

insert into public.products(name, description, category_id, price, discount, stock, image_url, rating)
select v.name, v.descr, c.id, v.price, v.discount, v.stock, v.img, v.rating from (values
('iPhone 15','6.1-inch Super Retina XDR display, A16 Bionic chip, 48MP main camera and USB-C.','Smartphones',79900,8,25,'https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=800',4.7),
('Samsung Galaxy S24','Dynamic AMOLED 2X display, Galaxy AI features and a pro-grade triple camera.','Smartphones',74999,12,30,'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=800',4.6),
('MacBook Air M3','13.6-inch Liquid Retina display, M3 chip, 18-hour battery in a fanless design.','Laptops',114900,6,15,'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800',4.8),
('Dell XPS 13','InfinityEdge display, Intel Core Ultra processor and premium aluminium build.','Laptops',99990,10,12,'https://images.unsplash.com/photo-1593642702821-c8da6771f0c6?w=800',4.5),
('Sony WH-1000XM5','Industry-leading noise cancellation with 30-hour battery and crystal-clear calls.','Electronics',29990,15,40,'https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?w=800',4.7),
('Smart Watch Pro','AMOLED display, heart-rate and SpO2 tracking, GPS and 7-day battery.','Accessories',8999,20,60,'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800',4.3),
('Canon EOS 90D DSLR','32.5MP APS-C sensor, 4K video and 45-point all cross-type autofocus.','Cameras',109995,9,8,'https://images.unsplash.com/photo-1502920917128-1aa500764cbd?w=800',4.6),
('Running Shoes Air','Lightweight mesh upper with responsive foam cushioning for daily runs.','Footwear',4999,25,80,'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800',4.4),
('Urban Backpack','Water-resistant 25L backpack with padded laptop sleeve and USB port.','Accessories',2499,30,100,'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800',4.2),
('Wireless Mouse','Ergonomic silent-click mouse with 2.4GHz receiver and 18-month battery.','Electronics',1299,18,150,'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=800',4.3),
('Classic Denim Jacket','Timeless washed denim jacket with a relaxed fit.','Fashion',3499,22,45,'https://images.unsplash.com/photo-1551537482-f2075a1d41f2?w=800',4.1),
('Mirrorless Camera Z','24MP full-frame mirrorless camera with in-body stabilisation.','Cameras',149999,7,6,'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=800',4.7)
) as v(name, descr, cat, price, discount, stock, img, rating) join public.categories c on c.name = v.cat;