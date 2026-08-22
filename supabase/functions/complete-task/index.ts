import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

Deno.serve(async (req) => {
  const authHeader = req.headers.get('Authorization')
  if (!authHeader) return new Response('Unauthorized', { status: 401 })

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  )

  const { data: { user } } = await supabase.auth.getUser(authHeader)
  if (!user) return new Response('Unauthorized', { status: 401 })

  const { task_id, proof_url } = await req.json()
  if (!task_id) return new Response('Missing task_id', { status: 400 })

  // 1. Lấy task từ DB (Lấy reward_coins từ DB, KHÔNG tin client)
  const { data: task } = await supabase.from('tasks').select('id, reward_coins').eq('id', task_id).single()
  if (!task) return new Response('Task not found', { status: 404 })

  // 2. KIỂM TRA XEM USER ĐÃ HOÀN THÀNH TASK NÀY CHƯA (Chống nhận thưởng nhiều lần)
  const { data: existingCompletion } = await supabase
    .from('task_completions')
    .select('id')
    .eq('user_id', user.id)
    .eq('task_id', task_id)
    .eq('reward_claimed', true)
    .single()

  if (existingCompletion) {
    return new Response('Task already completed', { status: 400 })
  }

  // 3. Cộng coin cho user
  await supabase.rpc('add_coins', { p_user_id: user.id, p_amount: task.reward_coins })

  // 4. Ghi nhận hoàn thành
  await supabase.from('task_completions').insert({
    user_id: user.id,
    task_id: task_id,
    proof_url: proof_url,
    reward_claimed: true,
    reward_amount: task.reward_coins
  })

  await supabase.from('audit_logs').insert({
    user_id: user.id,
    action: 'complete_task',
    metadata: { task_id: task_id, reward: task.reward_coins }
  })

  return Response.json({ success: true, coins_earned: task.reward_coins })
})
