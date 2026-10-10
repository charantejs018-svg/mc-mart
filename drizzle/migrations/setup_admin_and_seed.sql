-- ============================================================
-- SHOPKART FULL SETUP — run this in Supabase SQL Editor
-- Admin credentials:
--   Email   : admin@shopkart.com
--   Password: Admin@123
-- ============================================================

-- Step 1: Create admin user in auth.users
insert into auth.users (
  id,
  instance_id,
  email,
  encrypted_password,
  email_confirmed_at,
  raw_app_meta_data,
  raw_user_meta_data,
  created_at,
  updated_at,
  role,
  aud,
  confirmation_token,
  recovery_token,
  email_change_token_new,
  email_change
) values (
  '00000000-0000-0000-0000-000000000001',
  '00000000-0000-0000-0000-000000000000',
  'admin@shopkart.com',
  crypt('Admin@123', gen_salt('bf')),
  now(),
  '{"provider":"email","providers":["email"]}',
  '{"full_name":"Admin User"}',
  now(),
  now(),
  'authenticated',
  'authenticated',
  '',
  '',
  '',
  ''
) on conflict (id) do update set
  encrypted_password = crypt('Admin@123', gen_salt('bf')),
  email_confirmed_at = now();

-- Step 2: Create profile for admin
insert into public.profiles (id, full_name, email)
values ('00000000-0000-0000-0000-000000000001', 'Admin User', 'admin@shopkart.com')
on conflict (id) do nothing;

-- Step 3: Grant admin role
insert into public.user_roles (user_id, role)
values ('00000000-0000-0000-0000-000000000001', 'admin')
on conflict do nothing;

-- Step 4: Also ensure user role exists (handle_new_user trigger may not fire for manual inserts)
insert into public.user_roles (user_id, role)
values ('00000000-0000-0000-0000-000000000001', 'user')
on conflict do nothing;

-- Step 5: Seed categories (skip if already exist)
insert into public.categories (name, description) values
  ('Electronics',  'Gadgets and devices'),
  ('Fashion',      'Clothing and apparel'),
  ('Footwear',     'Shoes and sneakers'),
  ('Accessories',  'Bags, watches and more'),
  ('Smartphones',  'Latest mobile phones'),
  ('Laptops',      'Notebooks and ultrabooks'),
  ('Cameras',      'DSLR and mirrorless')
on conflict (name) do nothing;

-- Step 6: Seed products with images (skip if already exist by name)
insert into public.products (name, description, category_id, price, discount, stock, image_url, rating)
select v.name, v.descr, c.id, v.price, v.discount, v.stock, v.img, v.rating
from (values
  ('iPhone 15',          '6.1-inch Super Retina XDR display, A16 Bionic chip, 48MP main camera and USB-C.',       'Smartphones', 79900,  8,  25, 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=800', 4.7),
  ('Samsung Galaxy S24', 'Dynamic AMOLED 2X display, Galaxy AI features and a pro-grade triple camera.',          'Smartphones', 74999, 12,  30, 'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=800', 4.6),
  ('MacBook Air M3',     '13.6-inch Liquid Retina display, M3 chip, 18-hour battery in a fanless design.',        'Laptops',    114900,  6,  15, 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800', 4.8),
  ('Dell XPS 13',        'InfinityEdge display, Intel Core Ultra processor and premium aluminium build.',          'Laptops',     99990, 10,  12, 'https://images.unsplash.com/photo-1593642702821-c8da6771f0c6?w=800', 4.5),
  ('Sony WH-1000XM5',   'Industry-leading noise cancellation with 30-hour battery and crystal-clear calls.',      'Electronics', 29990, 15,  40, 'https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?w=800', 4.7),
  ('Smart Watch Pro',    'AMOLED display, heart-rate and SpO2 tracking, GPS and 7-day battery.',                  'Accessories',  8999, 20,  60, 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800', 4.3),
  ('Canon EOS 90D DSLR','32.5MP APS-C sensor, 4K video and 45-point all cross-type autofocus.',                  'Cameras',    109995,  9,   8, 'https://images.unsplash.com/photo-1502920917128-1aa500764cbd?w=800', 4.6),
  ('Running Shoes Air',  'Lightweight mesh upper with responsive foam cushioning for daily runs.',                 'Footwear',     4999, 25,  80, 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800', 4.4),
  ('Urban Backpack',     'Water-resistant 25L backpack with padded laptop sleeve and USB port.',                   'Accessories',  2499, 30, 100, 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800', 4.2),
  ('Wireless Mouse',     'Ergonomic silent-click mouse with 2.4GHz receiver and 18-month battery.',               'Electronics',  1299, 18, 150, 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=800', 4.3),
  ('Classic Denim Jacket','Timeless washed denim jacket with a relaxed fit.',                                     'Fashion',      3499, 22,  45, 'https://images.unsplash.com/photo-1551537482-f2075a1d41f2?w=800', 4.1),
  ('Mirrorless Camera Z','24MP full-frame mirrorless camera with in-body stabilisation.',                         'Cameras',    149999,  7,   6, 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=800', 4.7)
) as v(name, descr, cat, price, discount, stock, img, rating)
join public.categories c on c.name = v.cat
where not exists (select 1 from public.products p where p.name = v.name);

-- Step 7: Verify setup
select
  u.email,
  p.full_name,
  r.role,
  u.email_confirmed_at is not null as confirmed,
  (select count(*) from public.products) as total_products,
  (select count(*) from public.categories) as total_categories
from auth.users u
join public.profiles p on p.id = u.id
join public.user_roles r on r.user_id = u.id
where u.email = 'admin@shopkart.com' and r.role = 'admin';
