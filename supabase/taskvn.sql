-- Chạy trong Supabase Dashboard -> SQL Editor -> New query -> Run
-- (project chứa bảng profiles của web chính)
--
-- Nhận thưởng nhiệm vụ Taskvn qua Postback:
--   * mỗi task_id của Taskvn chỉ được cộng đúng 1 lần (khóa chính = task_id)
--   * xu cộng = số tiền member nhận bên Taskvn (1 xu = 1đ)
--   * chỉ service_role (hàm /api/taskvn-postback) mới gọi được

create table if not exists public.taskvn_rewards (
  task_id text primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  amount integer not null check (amount > 0),
  created_at timestamptz not null default now()
);

create index if not exists idx_taskvn_rewards_user
  on public.taskvn_rewards(user_id, created_at desc);

-- Bật RLS và KHÔNG tạo policy nào: người dùng không đọc/ghi trực tiếp được.
alter table public.taskvn_rewards enable row level security;

create or replace function public.taskvn_credit(
  p_task_id text,
  p_user_id uuid,
  p_amount integer
)
returns text
language plpgsql
security definer
set search_path = public
as $$
begin
  if p_amount is null or p_amount <= 0 then
    return 'bad_amount';
  end if;

  if not exists (select 1 from public.profiles where id = p_user_id) then
    return 'no_user';
  end if;

  insert into public.taskvn_rewards (task_id, user_id, amount)
  values (p_task_id, p_user_id, p_amount)
  on conflict (task_id) do nothing;

  if not found then
    return 'duplicate';
  end if;

  update public.profiles
  set coins = coins + p_amount,
      coins_earned_today = coins_earned_today + p_amount,
      tasks_completed_today = tasks_completed_today + 1
  where id = p_user_id;

  return 'credited';
end;
$$;

revoke all on function public.taskvn_credit(text, uuid, integer) from public, anon, authenticated;
grant execute on function public.taskvn_credit(text, uuid, integer) to service_role;
