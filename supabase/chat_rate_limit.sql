-- Giới hạn lượt chat ở phía server (chạy 1 lần trong Supabase > SQL Editor)
-- Chặn ngay lúc ghi tin nhắn của người dùng vào support_messages, nên bấm gì ở client cũng không qua mặt được.
-- Server nới hơn client một chút (client: 6 tin/phút, 40 tin/ngày) để tránh lệch khi mở nhiều tab.

create index if not exists support_messages_user_created_idx
  on public.support_messages (user_id, created_at desc);

create or replace function public.enforce_support_chat_limit()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  per_min int;
  per_day int;
begin
  -- chỉ đếm tin do người dùng gửi, tin của AI / nhân viên / hệ thống không bị giới hạn
  if new.sender_type is distinct from 'user' then
    return new;
  end if;

  select count(*) into per_day
    from public.support_messages
   where user_id = new.user_id
     and sender_type = 'user'
     and created_at > now() - interval '1 day';
  if per_day >= 50 then
    raise exception 'RATE_LIMIT_DAY' using errcode = 'P0001';
  end if;

  select count(*) into per_min
    from public.support_messages
   where user_id = new.user_id
     and sender_type = 'user'
     and created_at > now() - interval '1 minute';
  if per_min >= 8 then
    raise exception 'RATE_LIMIT_MIN' using errcode = 'P0001';
  end if;

  return new;
end;
$$;

drop trigger if exists support_messages_rate_limit on public.support_messages;
create trigger support_messages_rate_limit
  before insert on public.support_messages
  for each row execute function public.enforce_support_chat_limit();
