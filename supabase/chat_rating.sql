-- Bảng lưu đánh giá chất lượng hỗ trợ của chat AI (chạy 1 lần trong Supabase > SQL Editor)
-- score: 1 = Không hài lòng, 2 = Bình thường, 3 = Rất hài lòng

create table if not exists public.support_chat_ratings (
  id bigserial primary key,
  user_id uuid not null references auth.users (id) on delete cascade,
  conversation_id text not null,
  score smallint not null check (score between 1 and 3),
  reasons text[] not null default '{}',
  comment text,
  created_at timestamptz not null default now()
);

create index if not exists support_chat_ratings_user_idx
  on public.support_chat_ratings (user_id, created_at desc);

alter table public.support_chat_ratings enable row level security;

drop policy if exists "users insert own chat ratings" on public.support_chat_ratings;
create policy "users insert own chat ratings"
  on public.support_chat_ratings for insert to authenticated
  with check (auth.uid() = user_id);

drop policy if exists "users read own chat ratings" on public.support_chat_ratings;
create policy "users read own chat ratings"
  on public.support_chat_ratings for select to authenticated
  using (auth.uid() = user_id);
