import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

serve(async (req) => {
  // Xử lý CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { name, email, subject, message } = await req.json();

    // Validate
    if (!name || !email || !subject || !message) {
      return new Response(
        JSON.stringify({ error: "Thiếu thông tin bắt buộc" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Gửi email
    const { data, error } = await resend.emails.send({
      from: "NXX315 Studio <onboarding@resend.dev>",
      to: ["nxx315hub@gmail.com"],
      reply_to: email,
      subject: `[NXX315 Contact] ${subject} - ${name}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #38bdf8, #2563eb); color: white; padding: 20px; border-radius: 10px 10px 0 0; text-align: center; }
            .content { background: #f8fafc; padding: 20px; border-radius: 0 0 10px 10px; border: 1px solid #e2e8f0; }
            .field { margin: 12px 0; }
            .label { font-weight: bold; color: #475569; }
            .value { margin-top: 4px; padding: 8px 12px; background: white; border-radius: 6px; border: 1px solid #e2e8f0; }
            .footer { margin-top: 20px; text-align: center; font-size: 12px; color: #94a3b8; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1 style="margin:0;">📩 Liên hệ mới</h1>
          </div>
          <div class="content">
            <div class="field">
              <div class="label">Tên</div>
              <div class="value">${name}</div>
            </div>
            <div class="field">
              <div class="label">Email</div>
              <div class="value">${email}</div>
            </div>
            <div class="field">
              <div class="label">Chủ đề</div>
              <div class="value">${subject}</div>
            </div>
            <div class="field">
              <div class="label">Nội dung</div>
              <div class="value" style="white-space:pre-wrap;">${message}</div>
            </div>
          </div>
          <div class="footer">
            Gửi từ NXX315 Studio Rewards • ${new Date().toLocaleString('vi-VN')}
          </div>
        </body>
        </html>
      `,
    });

    if (error) throw error;

    return new Response(
      JSON.stringify({ success: true, data }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Email error:", error);
    return new Response(
      JSON.stringify({ error: error.message || "Lỗi gửi email" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
