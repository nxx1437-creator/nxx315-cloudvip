// supabase/functions/affiliate-callback/index.ts
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const body = await req.json()
    console.log("📦 Postback received:", JSON.stringify(body, null, 2))

    const { 
      order_id, 
      user_id, 
      event, 
      status,
      amount,
      product_name
    } = body

    // Tạo Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      { auth: { persistSession: false } }
    )

    // ===== XỬ LÝ THEO EVENT =====
    
    // 1. ĐƠN HÀNG BỊ HỦY
    if (event === 'order_cancelled' || status === 'cancelled') {
      console.log(`🔄 Đơn hàng #${order_id} bị hủy`)

      // Tìm pending transaction
      const { data: pendingData, error: findError } = await supabaseClient
        .from('pending_transactions')
        .select('*')
        .eq('order_id', order_id)
        .eq('user_id', user_id)
        .single()

      if (findError || !pendingData) {
        console.log("⚠️ Không tìm thấy pending transaction")
        return new Response(
          JSON.stringify({ success: true, message: "Không tìm thấy đơn hàng" }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
        )
      }

      // Nếu đã được duyệt (approved) thì trừ điểm
      if (pendingData.status === 'approved') {
        console.log(`⚠️ Đơn #${order_id} đã duyệt, đang trừ điểm...`)
        
        // Trừ điểm đã cộng
        const { error: deductError } = await supabaseClient.rpc('deduct_star_points', {
          p_user_id: user_id,
          p_amount: pendingData.star_points_expected
        })

        if (deductError) {
          console.error("❌ Lỗi trừ điểm:", deductError)
        } else {
          console.log("✅ Đã trừ điểm cho đơn hủy")
        }
      }

      // Cập nhật status thành 'cancelled'
      const { error: updateError } = await supabaseClient
        .from('pending_transactions')
        .update({
          status: 'cancelled',
          approved_time: new Date().toISOString(),
          note: 'Đơn hàng bị hủy'
        })
        .eq('id', pendingData.id)

      if (updateError) {
        console.error("❌ Lỗi cập nhật:", updateError)
      }

      return new Response(
        JSON.stringify({ 
          success: true, 
          message: "Đã xử lý đơn hủy",
          points_deducted: pendingData.status === 'approved' ? pendingData.star_points_expected : 0
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
      )
    }

    // 2. ĐƠN HÀNG THÀNH CÔNG (approved)
    if (event === 'order_approved' || status === 'approved') {
      console.log(`✅ Đơn hàng #${order_id} được duyệt`)

      // Tìm pending transaction
      const { data: pendingData, error: findError } = await supabaseClient
        .from('pending_transactions')
        .select('*')
        .eq('order_id', order_id)
        .eq('user_id', user_id)
        .single()

      if (findError || !pendingData) {
        // Tạo mới nếu chưa có
        const starPointsExpected = Math.floor((amount || 0) * 0.01)
        
        const { error: insertError } = await supabaseClient
          .from('pending_transactions')
          .insert({
            user_id: user_id,
            order_id: order_id,
            product_name: product_name || "Sản phẩm",
            amount: amount || 0,
            star_points_expected: starPointsExpected,
            status: 'approved',
            transaction_time: new Date().toISOString(),
            approved_time: new Date().toISOString(),
          })

        if (insertError) {
          console.error("❌ Lỗi tạo pending:", insertError)
        }

        // Cộng điểm
        const { error: addError } = await supabaseClient.rpc('add_star_points', {
          p_user_id: user_id,
          p_amount: starPointsExpected
        })

        if (addError) {
          console.error("❌ Lỗi cộng điểm:", addError)
        }

        return new Response(
          JSON.stringify({ success: true, message: "Đã tạo và cộng điểm" }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
        )
      }

      // Nếu đã cancelled thì không cộng
      if (pendingData.status === 'cancelled') {
        console.log(`⚠️ Đơn #${order_id} đã bị hủy trước đó, bỏ qua`)
        return new Response(
          JSON.stringify({ success: true, message: "Đơn đã bị hủy" }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
        )
      }

      // Nếu chưa duyệt thì cộng điểm
      if (pendingData.status !== 'approved') {
        const { error: addError } = await supabaseClient.rpc('add_star_points', {
          p_user_id: user_id,
          p_amount: pendingData.star_points_expected
        })

        if (addError) {
          console.error("❌ Lỗi cộng điểm:", addError)
        }
      }

      // Cập nhật status
      const { error: updateError } = await supabaseClient
        .from('pending_transactions')
        .update({
          status: 'approved',
          approved_time: new Date().toISOString(),
        })
        .eq('id', pendingData.id)

      if (updateError) {
        console.error("❌ Lỗi cập nhật:", updateError)
      }

      return new Response(
        JSON.stringify({ 
          success: true, 
          message: "Đã duyệt đơn hàng",
          points_added: pendingData.star_points_expected
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
      )
    }

    // 3. EVENT KHÁC (mặc định)
    return new Response(
      JSON.stringify({ 
        success: true, 
        message: "Đã nhận webhook",
        event: event 
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
