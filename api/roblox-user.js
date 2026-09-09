export default async function handler(req, res) {
  // Chỉ cho phép GET
  if (req.method !== 'GET') {
    return res.status(405).json({
      error: 'Method not allowed',
    });
  }

  const username = String(req.query.username || '').trim();

  if (!username) {
    return res.status(400).json({
      error: 'Vui lòng nhập username Roblox.',
    });
  }

  try {
    // Tìm Roblox user
    const userResponse = await fetch(
      'https://users.roblox.com/v1/usernames/users',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
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
        error: 'Không tìm thấy tài khoản Roblox này.',
      });
    }

    const user = userData.data[0];

    // Lấy avatar
    let avatar = null;

    try {
      const avatarResponse = await fetch(
        `https://thumbnails.roblox.com/v1/users/avatar-headshot?userIds=${user.id}&size=150x150&format=Png&isCircular=false`,
        {
          headers: {
            Accept: 'application/json',
          },
        }
      );

      if (avatarResponse.ok) {
        const avatarData = await avatarResponse.json();

        avatar =
          avatarData?.data?.[0]?.imageUrl || null;
      }
    } catch (avatarError) {
      console.error(
        'Avatar API error:',
        avatarError
      );
    }

    return res.status(200).json({
      id: user.id,
      username: user.name,
      displayName: user.displayName,
      avatar,
    });
  } catch (error) {
    console.error(
      'Roblox proxy error:',
      error
    );

    return res.status(500).json({
      error: 'Không thể kết nối tới Roblox.',
    });
  }
  }
