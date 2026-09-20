import { supabase } from "./supabaseClient";

// =====================================================
// FETCH POSTS
// =====================================================
const POST_SELECT = `
  id,
  author_id,
  content,
  image_url,
  category,
  video_links,
  status,
  likes_count,
  comments_count,
  created_at,
  author:profiles!posts_author_id_fkey (
    id,
    username,
    avatar_url
  )
`;

export async function fetchPosts(cursor = null, limit = 10) {
  let query = supabase
    .from("posts")
    .select(POST_SELECT)
    .eq("status", "visible")
    .order("created_at", { ascending: false })
    .limit(limit);

  if (cursor) {
    query = query.lt("created_at", cursor);
  }

  const { data, error } = await query;
  if (error) {
    console.error("fetchPosts error:", error);
    return [];
  }
  return data || [];
}

// =====================================================
// GET MY REACTIONS
// =====================================================
export async function getMyReactions(postIds, userId) {
  if (!postIds.length || !userId) {
    return { liked: new Set(), saved: new Set() };
  }

  const [likesRes, savesRes] = await Promise.all([
    supabase
      .from("post_likes")
      .select("post_id")
      .eq("user_id", userId)
      .in("post_id", postIds),
    supabase
      .from("post_saves")
      .select("post_id")
      .eq("user_id", userId)
      .in("post_id", postIds),
  ]);

  const liked = new Set((likesRes.data || []).map((r) => r.post_id));
  const saved = new Set((savesRes.data || []).map((r) => r.post_id));

  return { liked, saved };
}

// =====================================================
// CREATE POST
// =====================================================
export async function createPost({ userId, content, imageUrl, category }) {
  const { data, error } = await supabase
    .from("posts")
    .insert({
      author_id: userId,
      content: content.trim(),
      image_url: imageUrl || null,
      category: category || "general",
      status: "pending",
    })
    .select(
      `
      id,
      author_id,
      content,
      image_url,
      category,
      video_links,
      status,
      likes_count,
      comments_count,
      created_at
    `
    )
    .single();

  if (error) {
    console.error("createPost error:", error);
    throw error;
  }

  return data;
}

// =====================================================
// CHECK CAN POST
// =====================================================
export async function checkCanPost(userId) {
  const { data: profile, error } = await supabase
    .from("profiles")
    .select("coins, can_post")
    .eq("id", userId)
    .maybeSingle();

  if (error || !profile) {
    return {
      allowed: false,
      reason: "Không tìm thấy profile",
    };
  }

  if (profile.can_post === true) {
    return { allowed: true };
  }

  const { data: settings } = await supabase
    .from("community_settings")
    .select("key, value");

  const minCoins = Number(
    settings?.find((s) => s.key === "min_coin_balance_to_post")?.value || 100
  );

  if ((profile.coins || 0) < minCoins) {
    return {
      allowed: false,
      reason: `Cần ít nhất ${minCoins} Coin trong ví để đăng bài. Bạn đang có ${
        profile.coins || 0
      } Coin.`,
    };
  }

  return { allowed: true };
}

// =====================================================
// TOGGLE LIKE
// =====================================================
export async function toggleLike(postId, userId, isLiked) {
  if (isLiked) {
    const { error } = await supabase
      .from("post_likes")
      .delete()
      .eq("post_id", postId)
      .eq("user_id", userId);

    if (error) {
      console.error("unlike error:", error);
      return false;
    }

    await supabase.rpc("decrement_post_like", { p_post_id: postId });
    return true;
  } else {
    const { error } = await supabase
      .from("post_likes")
      .insert({ post_id: postId, user_id: userId });

    if (error) {
      if (error.code === "23505") return true;
      console.error("like error:", error);
      return false;
    }

    await supabase.rpc("increment_post_like", { p_post_id: postId });
    return true;
  }
}

// =====================================================
// TOGGLE SAVE
// =====================================================
export async function toggleSave(postId, userId, isSaved) {
  if (!userId) return false;

  if (isSaved) {
    const { error } = await supabase
      .from("post_saves")
      .delete()
      .eq("post_id", postId)
      .eq("user_id", userId);

    if (error) {
      console.error("unsave error:", error);
      return false;
    }
    return true;
  } else {
    const { error } = await supabase
      .from("post_saves")
      .insert({ post_id: postId, user_id: userId });

    if (error) {
      if (error.code === "23505") return true;
      console.error("save error:", error);
      return false;
    }
    return true;
  }
}

// =====================================================
// FETCH COMMENTS
// =====================================================
export async function fetchComments(postId) {
  const { data, error } = await supabase
    .from("post_comments")
    .select(
      `
      id,
      post_id,
      author_id,
      content,
      created_at,
      author:profiles!post_comments_author_id_fkey (
        id,
        username,
        avatar_url
      )
    `
    )
    .eq("post_id", postId)
    .order("created_at", { ascending: true });

  if (error) {
    console.error("fetchComments error:", error);
    return [];
  }
  return data || [];
}

// =====================================================
// ADD COMMENT
// =====================================================
export async function addComment({ postId, userId, content }) {
  const { data, error } = await supabase
    .from("post_comments")
    .insert({
      post_id: postId,
      author_id: userId,
      content: content.trim(),
    })
    .select(
      `
      id,
      post_id,
      author_id,
      content,
      created_at
    `
    )
    .single();

  if (error) {
    console.error("addComment error:", error);
    throw error;
  }

  await supabase.rpc("increment_post_comment", { p_post_id: postId });

  return data;
}

// =====================================================
// RECORD SHARE
// =====================================================
export async function recordShare(postId, userId) {
  try {
    await supabase.rpc("increment_post_share", { p_post_id: postId });
  } catch (err) {
    console.warn("recordShare error:", err);
  }
}

// =====================================================
// REPORT POST
// =====================================================
export async function reportPost({ postId, userId, reason }) {
  const { error } = await supabase.from("post_reports").insert({
    post_id: postId,
    reporter_id: userId,
    reason,
  });

  if (error) {
    console.error("reportPost error:", error);
    return false;
  }
  return true;
}

// =====================================================
// GET SAVED POSTS
// =====================================================
export async function getMySavedPosts(userId) {
  if (!userId) return [];

  const { data, error } = await supabase
    .from("post_saves")
    .select(
      `
      post_id,
      created_at,
      post:posts!post_saves_post_id_fkey (
        id,
        author_id,
        content,
        image_url,
        category,
        video_links,
        status,
        likes_count,
        comments_count,
        created_at,
        author:profiles!posts_author_id_fkey (
          id,
          username,
          avatar_url
        )
      )
    `
    )
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("getMySavedPosts error:", error);
    return [];
  }

  return (data || []).map((r) => r.post).filter(Boolean);
    }
