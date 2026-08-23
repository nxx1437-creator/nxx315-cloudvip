import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
const RECAPTCHA_SECRET_KEY = Deno.env.get('RECAPTCHA_SECRET_KEY')! // Lưu Secret Key ở đây

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

Deno.serve(async (req) => {
  const authHeader = req.headers.get('Authorization')
  if (!authHeader) return new Response('Unauthorized', { status: 401 })
  
  const { data: { user } } = await supabase.auth.getUser(authHeader)
  if (!user) return new Response('Unauthorized', { status: 401 })

  // 1. Đọc dữ liệu gửi lên (gồm Token nhiệm vụ và Token reCAPTCHA)
  const { token, recaptcha_token } = await req.json()
  if (!token || !recaptcha_token) return new Response('Missing token or recaptcha', { status: 400 })

  // 2. Xác thực reCAPTCHA với Google
  const verification = await fetch('https://www.google.com/recaptcha/api/siteverify', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      secret: RECAPTCHA_SECRET_KEY,
      response: recaptcha_token,
    }),
  });
  const captchaResult = await verification.json();

  if (!captchaResult.success) {
    return Response.json({ error: 'Xác thực reCAPTCHA thất bại!' }, { status: 400 })
  }

  // 3. Xác thực Token nhiệm vụ (như cũ)
  const { data: session } = await supabase.from('task_sessions').select('*').eq('token', token).single()
  if (!session) return Response.json({ error: 'Token không hợp lệ!' }, { status: 400 })
  if (session.user_id !== user.id) return Response.json({ error: 'Token không thuộc về bạn!' }, { status: 403 })
  if (new Date(session.expires_at) < new Date()) return Response.json({ error: 'Token đã hết hạn!' }, { status: 400 })
  if (session.status === 'used') return Response.json({ error: 'Token đã được sử dụng!' }, { status: 400 })

  // 4. Kiểm tra token có hợp lệ với Link4m/Site2S không
  let isValid = false
  if (session.provider === 'link4m') {
    const res = await fetch(`https://api.link4m.com/validate?token=${token}&api_key=${LINK4M_API_KEY}`)
    isValid = res.ok
  } else if (session.provider === 'site2s') {
    const res = await fetch(`https://api.site2s.com/validate?token=${token}&api_key=${SITE2S_API_KEY}`)
    isValid = res.ok
  }

  if (!isValid) return Response.json({ error: 'Token không hợp lệ với nhà mạng!' }, { status: 400 })

  // 5. Cộng coin (như cũ)
  const { data: task } = await supabase.from('tasks').select('reward_coins').eq('id', session.task_id).single()
  const { data: profile } = await supabase.from('profiles').select('coins').eq('id', user.id).single()
  
  await supabase.from('profiles').update({ coins: profile.coins + task.reward_coins }).eq('id', user.id)
  await supabase.from('task_sessions').update({ status: 'used', claimed_at: new Date().toISOString() }).eq('id', session.id)
  await supabase.from('task_completions').insert({
    user_id: user.id,
    task_id: task.id,
    reward_claimed: true,
    reward_amount: task.reward_coins
  })

  return Response.json({ success: true, coins_earned: task.reward_coins })
})
