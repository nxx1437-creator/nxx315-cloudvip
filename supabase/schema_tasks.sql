-- Chạy đoạn này trong Supabase Dashboard -> SQL Editor -> New query -> Run
-- (Chạy SAU khi đã chạy supabase/schema.sql ở bước trước, vì cần bảng profiles)
--
-- Cài đặt hệ thống "vượt link" theo mô hình Token-based Validation:
--   1. start_task()      -> sinh Token ngẫu nhiên, TTL 15 phút (Khởi tạo phiên)
--   2. (Frontend)        -> mở link nhà cung cấp (Layma/Link4m/Traffic68) kèm Token
--   3. (Nhà cung cấp)    -> redirect người dùng về /task/callback?token=... của bạn
--   4. consume_task_token() -> kiểm tra tồn tại / hết hạn / đã dùng, rồi khóa Token
--   5. (Trong cùng hàm)  -> cộng Coin, EXP, cập nhật thống kê hôm nay

-- ============ BẢNG ============

create table if not exists public.tasks (
  id uuid primary key default gen_random_uuid(),
  provider text not null,            -- ví dụ: 'LAYMA', 'LINK4M', 'TRAFFIC68'
  logo_url text,
  reward_coins integer not null default 0,
  daily_limit integer not null default 2,   -- số lượt/ngày mỗi người dùng
  is_hot boolean not null default false,
  sort_order integer not null default 0,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.task_tokens (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  task_id uuid not null references public.tasks(id) on delete cascade,
  token text not null unique,
  status text not null default 'pending' check (status in ('pending', 'used', 'expired')),
  created_at timestamptz not null default now(),
  expires_at timestamptz not null
);

create table if not exists public.task_completions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  task_id uuid not null references public.tasks(id) on delete cascade,
  coins_earned integer not null,
  completed_at timestamptz not null default now()
);

create index if not exists idx_task_tokens_token on public.task_tokens(token);
create index if not exists idx_task_completions_user_day
  on public.task_completions(user_id, task_id, completed_at);

-- ============ RLS ============

alter table public.tasks enable row level security;
alter table public.task_tokens enable row level security;
alter table public.task_completions enable row level security;

create policy "Ai đăng nhập cũng xem được danh sách nhiệm vụ"
  on public.tasks for select
  using (auth.role() = 'authenticated');

create policy "Người dùng xem token của chính mình"
  on public.task_tokens for select
  using (auth.uid() = user_id);

create policy "Người dùng xem lịch sử hoàn thành của chính mình"
  on public.task_completions for select
  using (auth.uid() = user_id);

-- Không có policy insert/update trực tiếp cho task_tokens/task_completions —
-- mọi ghi dữ liệu đều đi qua 2 hàm RPC bên dưới (SECURITY DEFINER) để đảm bảo
-- không ai tự ý set status = 'used' hay tự cộng Coin cho mình.

-- ============ BƯỚC 1: KHỞI TẠO PHIÊN ============

create or replace function public.start_task(p_task_id uuid)
returns table(token text, expires_at timestamptz, reward_coins integer)
language plpgsql
security definer
set search_path = public, extensions
as $$
declare
  v_task record;
  v_done_today integer;
  v_token text;
  v_expires timestamptz;
begin
  select * into v_task from public.tasks where id = p_task_id and active = true;
  if not found then
    raise exception 'Nhiệm vụ không tồn tại hoặc đã tắt';
  end if;

  select count(*) into v_done_today
  from public.task_completions
  where user_id = auth.uid()
    and task_id = p_task_id
    and completed_at >= date_trunc('day', now());

  if v_done_today >= v_task.daily_limit then
    raise exception 'Bạn đã hết lượt cho nhiệm vụ này hôm nay';
  end if;

  v_token := encode(extensions.gen_random_bytes(16), 'hex');
  v_expires := now() + interval '15 minutes';

  insert into public.task_tokens (user_id, task_id, token, expires_at)
  values (auth.uid(), p_task_id, v_token, v_expires);

  return query select v_token, v_expires, v_task.reward_coins;
end;
$$;

-- ============ BƯỚC 4 + 5: XÁC THỰC, TIÊU THỤ TOKEN, TRẢ THƯỞNG ============

create or replace function public.consume_task_token(p_token text)
returns table(success boolean, message text, reward_coins integer)
language plpgsql
security definer
set search_path = public, extensions
as $$
declare
  v_row public.task_tokens;
  v_reward integer;
begin
  -- UPDATE có điều kiện trong 1 câu lệnh duy nhất = atomic, tránh race condition
  -- (2 request cùng lúc dùng chung 1 token sẽ chỉ có đúng 1 cái thành công).
  update public.task_tokens
  set status = 'used'
  where token = p_token
    and user_id = auth.uid()
    and status = 'pending'
    and expires_at > now()
  returning * into v_row;

  if v_row.id is null then
    -- Phân biệt lý do thất bại để hiển thị thông báo rõ ràng cho người dùng
    if exists (select 1 from public.task_tokens where token = p_token and user_id = auth.uid() and status = 'used') then
      return query select false, 'Mã này đã được sử dụng trước đó.', 0;
    elsif exists (select 1 from public.task_tokens where token = p_token and user_id = auth.uid() and expires_at <= now()) then
      return query select false, 'Mã đã hết hạn. Vui lòng làm lại nhiệm vụ.', 0;
    else
      return query select false, 'Mã không hợp lệ.', 0;
    end if;
  end if;

  select reward_coins into v_reward from public.tasks where id = v_row.task_id;

  insert into public.task_completions (user_id, task_id, coins_earned)
  values (auth.uid(), v_row.task_id, v_reward);

  update public.profiles
  set coins = coins + v_reward,
      coins_earned_today = coins_earned_today + v_reward,
      tasks_completed_today = tasks_completed_today + 1,
      exp = exp + 10
  where id = auth.uid();

  return query select true, 'Nhận thưởng thành công!', v_reward;
end;
$$;

-- ============ DỮ LIỆU MẪU (xóa hoặc sửa lại cho đúng nhiệm vụ thật) ============

insert into public.tasks (provider, logo_url, reward_coins, daily_limit, is_hot, sort_order)
values
  ('LAYMA', null, 400, 2, true, 1),
  ('LINK4M', null, 360, 2, true, 2),
  ('TRAFFIC68', null, 320, 2, true, 3)
on conflict do nothing;
