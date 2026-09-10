import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.ROBLOX_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.ROBLOX_SUPABASE_ANON_KEY;

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({
      error: "Method not allowed",
    });
  }

  const username = String(req.query.username || "").trim();

  if (!username) {
    return res.status(400).json({
      error: "Vui lòng nhập username Roblox.",
    });
  }

  // ================================
  // KIỂM TRA ĐĂNG NHẬP
  // ================================

  const authorization = req.headers.authorization;

  if (!authorization?.startsWith("Bearer ")) {
    return res.status(401).json({
      error: "Bạn chưa đăng nhập.",
    });
  }

  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    console.error("Thiếu SUPABASE_URL / SUPABASE_ANON_KEY");

    return res.status(500).json({
      error: "Server chưa cấu hình Supabase.",
    });
  }

  try {
    const supabase = createClient(
      SUPABASE_URL,
      SUPABASE_ANON_KEY,
      {
        global: {
          headers: {
            Authorization: authorization,
          },
        },
      }
    );

    // ================================
    // XÁC THỰC USER
    // ================================

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return res.status(401).json({
        error: "Phiên đăng nhập không hợp lệ.",
      });
    }

    // ================================
    // GIỚI HẠN 10 LẦN / NGÀY
    // ================================

    const { data: limitResult, error: limitError } =
      await supabase.rpc(
        "consume_daily_limit",
        {
          p_action: "roblox",
          p_amount: 0,
        }
      );

    if (limitError) {
      console.error(
        "Roblox daily limit error:",
        limitError
      );

      return res.status(500).json({
        error: "Không thể kiểm tra giới hạn hôm nay.",
      });
    }

    if (!limitResult?.success) {
      return res.status(429).json({
        error:
          limitResult?.message ||
          "Bạn đã đạt giới hạn kiểm tra Roblox hôm nay.",
        code: limitResult?.code || "DAILY_LIMIT",
        remaining: limitResult?.remaining ?? 0,
      });
    }

    // ================================
    // GỌI ROBLOX API
    // ================================

    const userResponse = await fetch(
      "https://users.roblox.com/v1/usernames/users",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          usernames: [username],
          excludeBannedUsers: false,
        }),
      }
    );

    if (!userResponse.ok) {
      const text = await userResponse.text();

      return res.status(userResponse.status).json({
        error: `Roblox API lỗi HTTP ${userResponse.status}`,
        details: text,
      });
    }

    const userData = await userResponse.json();

    if (
      !Array.isArray(userData.data) ||
      userData.data.length === 0
    ) {
      return res.status(404).json({
        error: "Không tìm thấy tài khoản Roblox này.",
      });
    }

    const userDataItem = userData.data[0];

    // ================================
    // LẤY AVATAR
    // ================================

    let avatar = null;

    try {
      const avatarResponse = await fetch(
        `https://thumbnails.roblox.com/v1/users/avatar-headshot?userIds=${userDataItem.id}&size=150x150&format=Png&isCircular=false`,
        {
          headers: {
            Accept: "application/json",
          },
        }
      );

      if (avatarResponse.ok) {
        const avatarData =
          await avatarResponse.json();

        avatar =
          avatarData?.data?.[0]?.imageUrl || null;
      }
    } catch (avatarError) {
      console.error(
        "Avatar API error:",
        avatarError
      );
    }

    // ================================
    // TRẢ KẾT QUẢ
    // ================================

    return res.status(200).json({
      success: true,

      id: userDataItem.id,

      username: userDataItem.name,

      displayName:
        userDataItem.displayName,

      avatar,

      remaining_checks:
        limitResult.remaining,
    });
  } catch (error) {
    console.error(
      "Roblox proxy error:",
      error
    );

    return res.status(500).json({
      error:
        error instanceof Error
          ? error.message
          : "Không thể kết nối tới Roblox.",
    });
  }
}
