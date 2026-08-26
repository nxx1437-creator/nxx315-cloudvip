import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

serve(async (req) => {
  try {
    const { name, email, subject, message } = await req.json();

    const { data, error } = await resend.emails.send({
      from: "NXX315 Studio <onboarding@resend.dev>",
      to: ["nxx315hub@gmail.com"],
      reply_to: email,
      subject: `[NXX315] ${subject} - ${name}`,
      html: `
        <h2>📩 Liên hệ mới</h2>
        <p><strong>Tên:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Chủ đề:</strong> ${subject}</p>
        <p><strong>Nội dung:</strong></p>
        <p>${message}</p>
      `
    });

    if (error) throw error;

    return new Response(JSON.stringify({ success: true }), {
      headers: { "Content-Type": "application/json" }
    });

  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
});
