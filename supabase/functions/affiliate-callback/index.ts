// supabase/functions/affiliate-callback/index.ts
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  // Xử lý CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Nhận dữ liệu từ AccessTrade gửi sang
    const body = await req.json()
    console.log("📦 Postback received:", body)

    // ===== PHÂN TÍCH DỮ LIỆU TỪ ACCESSTRADE =====
    // AccessTrade sẽ gửi:
    // - order_id: mã đơn hàng
    // - product_name: tên sản phẩm
    // - amount: số tiền
    // - commission: hoa hồng
    // - click_id: ID click để tracking
    
    const { 
      order_id, 
      product_name, 
      amount, 
      commission,
      click_id,
      user_id 
    } = body

    // Tạo Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      { auth: { persistSession: false } }
    )

    // ===== CẬP NHẬT PENDING TRANSACTION =====
    // Tìm pending transaction với order_id
    const { data: pendingData, error: findError } = await supabaseClient
      .from('pending_transactions')
      .select('*')
      .eq('order_id', order_id)
      .eq('status', 'pending')
      .single()

    if (findError || !pendingData) {
      console.log("Không tìm thấy pending transaction, tạo mới...")
      
      // Nếu chưa có, tạo mới pending transaction
      const { error: insertError } = await supabaseClient
        .from('pending_transactions')
        .insert({
          user_id: user_id,
          order_id: order_id,
          product_name: product_name || "Sản phẩm",
          amount: amount || 0,
          star_points_expected: Math.floor((amount || 0) * 0.01),
          status: 'pending',
          transaction_time: new Date().toISOString(),
        })

      if (insertError) {
        console.error("❌ Lỗi tạo pending:", insertError)
      }
      
      return new Response(
        JSON.stringify({ success: true, message: "Tạo pending mới" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
      )
    }

    // ===== CẬP NHẬT STATUS =====
    // Nếu đơn hàng thành công, chuyển status thành 'approved'
    const { error: updateError } = await supabaseClient
      .from('pending_transactions')
      .update({
        status: 'approved',
        approved_time: new Date().toISOString(),
      })
      .eq('id', pendingData.id)

    if (updateError) {
      console.error("❌ Lỗi cập nhật pending:", updateError)
      return new Response(
        JSON.stringify({ success: false, error: updateError.message }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
      )
    }

    // ===== CỘNG ĐIỂM VÀO PROFILE =====
    const { error: profileError } = await supabaseClient
      .from('profiles')
      .update({
        star_points: supabaseClient.rpc('increment', { 
          row_id: pendingData.user_id, 
          amount: pendingData.star_points_expected 
        })
      })
      .eq('id', pendingData.user_id)

    if (profileError) {
      console.error("❌ Lỗi cộng điểm:", profileError)
    }

    console.log("✅ Đã xử lý postback thành công!")

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: "Đã cập nhật điểm cho user",
        star_points_added: pendingData.star_points_expected
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
    )

  } catch (error) {
    console.error("❌ Lỗi:", error)
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
    )
  }
})
