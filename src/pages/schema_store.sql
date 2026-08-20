-- ============================================================
-- schema_store.sql — Trang Cửa hàng (đổi Coin lấy Robux)
-- Chạy TOÀN BỘ file này 1 lần trong Supabase SQL Editor.
-- Giá Coin hiện đang là TẠM (placeholder) — sửa sau bằng:
--   update public.redemption_packages set coin_cost = <giá thật> where id = '...';
-- ============================================================

-- 1. Bảng các gói Robux đang bán
create table if not exists public.redemption_packages (
  id uuid primary key default extensions.gen_random_uuid(),
  name text not null,                    -- "Gói 40 Robux"
  version text not null check (version in ('VNG', 'QUOC_TE')),
  robux_amount integer not null,
  coin_cost integer not null,            -- số Coin bị trừ khi đổi gói này
  original_price_text text,              -- "14.000đ" — chỉ để hiển thị tham khảo
  is_promo boolean not null default false,
  active boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

alter table public.redemption_packages enable row level security;

drop policy if exists "Ai cũng xem được gói đang bán" on public.redemption_packages;
create policy "Ai cũng xem được gói đang bán"
  on public.redemption_packages for select
  using (active = true);

-- Seed 4 gói theo yêu cầu — coin_cost TẠM = giá gốc VNĐ / 10 (placeholder dễ đổi)
insert into public.redemption_packages (name, version, robux_amount, coin_cost, original_price_text, is_promo, sort_order)
values
  ('Gói 40 Robux',  'VNG',     40,  1400,  '14.000đ',  false, 1),
  ('Gói 80 Robux',  'VNG',     80,  2800,  '28.000đ',  false, 2),
  ('Gói 500 Robux (Khuyến mãi)', 'VNG', 500, 14000, '140.000đ', true, 3),
  ('Code 100 Robux', 'QUOC_TE', 100, 10000, null,      false, 4)
on conflict do nothing;


-- 2. Bảng đơn đổi thưởng
create table if not exists public.redemption_orders (
  id uuid primary key default extensions.gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  package_id uuid not null references public.redemption_packages(id),

  -- snapshot lại thông tin gói tại thời điểm đặt (để sau này đổi giá không ảnh hưởng đơn cũ)
  package_name text not null,
  version text not null check (version in ('VNG', 'QUOC_TE')),

  roblox_username text not null,
  receive_method text check (receive_method in ('discord', 'zalo')), -- chỉ dùng khi version = QUOC_TE
  contact_value text,                                                 -- SĐT Zalo hoặc tên Discord

  status text not null default 'pending' check (status in ('pending', 'delivered', 'cancelled')),
  coins_charged integer not null,
  coins_refunded integer not null default 0,
  admin_note text,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.redemption_orders enable row level security;

drop policy if exists "Người dùng xem đơn của chính mình" on public.redemption_orders;
create policy "Người dùng xem đơn của chính mình"
  on public.redemption_orders for select
  using (auth.uid() = user_id);


-- 3. Hàm đặt đơn — trừ Coin ngay khi đặt (an toàn, atomic, chặn số dư âm)
create or replace function public.place_redemption_order(
  p_package_id uuid,
  p_roblox_username text,
  p_receive_method text default null,
  p_contact_value text default null
)
returns table(success boolean, message text, order_id uuid)
language plpgsql
security definer
set search_path to 'public', 'extensions'
as $function$
declare
  v_pkg public.redemption_packages;
  v_balance integer;
  v_order_id uuid;
begin
  select * into v_pkg from public.redemption_packages where id = p_package_id and active = true;
  if v_pkg.id is null then
    return query select false, 'Gói này hiện không khả dụng.', null::uuid;
    return;
  end if;

  if v_pkg.version = 'QUOC_TE' and (p_receive_method is null or p_contact_value is null or p_contact_value = '') then
    return query select false, 'Vui lòng chọn cách nhận code và điền thông tin liên hệ.', null::uuid;
    return;
  end if;

  select coins into v_balance from public.profiles where id = auth.uid() for update;
  if v_balance is null or v_balance < v_pkg.coin_cost then
    return query select false, 'Số dư Coin không đủ để đổi gói này.', null::uuid;
    return;
  end if;

  update public.profiles set coins = coins - v_pkg.coin_cost where id = auth.uid();

  insert into public.redemption_orders
    (user_id, package_id, package_name, version, roblox_username, receive_method, contact_value, coins_charged)
  values
    (auth.uid(), v_pkg.id, v_pkg.name, v_pkg.version, p_roblox_username,
     case when v_pkg.version = 'QUOC_TE' then p_receive_method else null end,
     case when v_pkg.version = 'QUOC_TE' then p_contact_value else null end,
     v_pkg.coin_cost)
  returning id into v_order_id;

  return query select true, 'Đặt đơn thành công! Admin sẽ xử lý trong vài phút.', v_order_id;
end;
$function$;


-- 4. Tự động hoàn Coin khi admin đổi trạng thái đơn sang "cancelled"
create or replace function public.handle_order_cancellation()
returns trigger
language plpgsql
security definer
set search_path to 'public', 'extensions'
as $function$
begin
  if new.status = 'cancelled' and old.status <> 'cancelled' and new.coins_refunded = 0 then
    update public.profiles set coins = coins + new.coins_charged where id = new.user_id;
    new.coins_refunded := new.coins_charged;
  end if;
  new.updated_at := now();
  return new;
end;
$function$;

drop trigger if exists on_order_cancelled on public.redemption_orders;
create trigger on_order_cancelled
  before update on public.redemption_orders
  for each row execute function public.handle_order_cancellation();
