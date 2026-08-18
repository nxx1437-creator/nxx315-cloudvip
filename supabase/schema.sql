-- Chạy đoạn này trong Supabase Dashboard -> SQL Editor -> New query -> Run
-- Tạo bảng profiles lưu Coin, Level, EXP, streak... cho từng người dùng.

create table if not exists public.profiles (
  id uuid references auth.users(id) on delete cascade primary key,
  username text,
  coins integer not null default 0,
  level integer not null default 1,
  exp integer not null default 0,
  exp_target integer not null default 100,
  streak_days integer not null default 0,
  streak_record integer not null default 0,
  tasks_completed_today integer not null default 0,
  coins_earned_today integer not null default 0,
  referrals_count integer not null default 0,
  created_at timestamptz not null default now()
);

-- Bật Row Level Security: mỗi người chỉ đọc/sửa được đúng hàng của mình.
alter table public.profiles enable row level security;

create policy "Người dùng xem được profile của chính mình"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Người dùng sửa được profile của chính mình"
  on public.profiles for update
  using (auth.uid() = id);

-- Tự động tạo 1 hàng profiles mỗi khi có người đăng ký mới
-- (áp dụng cho cả đăng ký email/password lẫn Google/Discord OAuth).
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, username)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'username', split_part(new.email, '@', 1))
  );
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
  
