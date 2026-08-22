import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

Deno.serve(async (req) => {
  // 1. Lấy Authorization từ request
  const authHeader = req.headers.get('Authorization')
  if (!authHeader) return new Response('Unauthorized', { status: 401 })

  // 2. Tạo Supabase Client với Service Role Key (CHỈ DÙNG Ở SERVER)
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  )

  // 3. Xác thực user
  const { data: { user } } = await supabase.auth.getUser(authHeader)
  if (!user) return new Response('Unauthorized', { status: 401 })

  // 4. Đọc dữ liệu request (Chỉ đọc package_id, KHÔNG tin cậy coin hay user_id)
  const { package_id, receive_method, contact_value } = await req.json()

  // 5. VALIDATE INPUT (Chống SQL injection / dữ liệu rác)
  if (!package_id || !receive_method || !contact_value) {
    return new Response('Missing required fields', { status: 400 })
  }

  // 6. Lấy gói từ DATABASE (KHÔNG tin dữ liệu client gửi lên)
  const { data: pkg, error: pkgError } = await supabase
    .from('redemption_packages')
    .select('id, coin_cost, name')
    .eq('id', package_id)
    .eq('active', true)
    .single()

  if (pkgError || !pkg) return new Response('Package not found', { status: 404 })

  // 7. Kiểm tra số dư user từ DATABASE
  const { data: profile } = await supabase
    .from('profiles')
    .select('coins')
    .eq('id', user.id)
    .single()

  if (!profile || profile.coins < pkg.coin_cost) {
    return new Response('Insufficient balance', { status: 400 })
  }

  // 8. CẬP NHẬT COIN BẰNG TRANSACTION (Chống double-click)
  // Trừ coin cho user
  const { error: deductError } = await supabase
    .rpc('deduct_coins', { p_user_id: user.id, p_amount: pkg.coin_cost })

  if (deductError) return new Response('Failed to deduct coins', { status: 500 })

  // 9. TẠO REDEMPTION (Lưu metadata, KHÔNG lưu code)
  const { data: order, error: orderError } = await supabase
    .from('redemption_orders')
    .insert({
      user_id: user.id,
      package_name: pkg.name,
      coins_charged: pkg.coin_cost,
      receive_method,
      contact_value: contact_value, // Sẽ được che ở frontend
      status: 'processing',
    })
    .select()
    .single()

  if (orderError) {
    // Nếu tạo đơn thất bại, HOÀN COIN lại cho user (Rollback)
    await supabase.rpc('add_coins', { p_user_id: user.id, p_amount: pkg.coin_cost })
    return new Response('Failed to create order', { status: 500 })
  }

  // 10. LOG AUDIT
  await supabase.from('audit_logs').insert({
    user_id: user.id,
    action: 'redeem_reward',
    metadata: { order_id: order.id, package_name: pkg.name }
  })

  // 11. Trả về kết quả (KHÔNG trả về code)
  return Response.json({ success: true, order_id: order.id, message: 'Redemption created' })
})
