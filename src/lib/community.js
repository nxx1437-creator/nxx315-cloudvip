import { supabase } from "./supabaseClient";

const POSTS_PER_PAGE = 10;

export async function fetchPosts(cursor = null) {
  let query = supabase
    .from("community_posts")
    .select("*, author:profiles!community_posts_user_id_fkey(username, avatar_url, is_official)")
    .eq("status", "active")
    .order("created_at", { ascending: false })
    .limit(POSTS_PER_PAGE);

  if (cursor) query = query.lt("created_at", cursor);

  const { data, error } = await query;
  if (error) throw error;
  return data ?? [];
}

export async function fetchComments(postId) {
  const { data, error } = await supabase
    .from("community_comments")
    .select("*, author:profiles!community_comments_user_id_fkey(username, avatar_url)")
    .eq("post_id", postId)
    .order("created_at", { ascending: true });

  if (error) throw error;
  return data ?? [];
}

export async function uploadPostImage(file, userId) {
  const ext = file.name.split(".").pop();
  const path = `${userId}/${Date.now()}.${ext}`;

  const { error } = await supabase.storage
    .from("post-images")
    .upload(path, file, { cacheControl: "3600", upsert: false });

  if (error) throw error;

  const { data } = supabase.storage.from("post-images").getPublicUrl(path);
  return data.publicUrl;
        }
export async function createPost({ userId, content, imageFile, linkUrl }) {
  let imageUrl = null;
  if (imageFile) imageUrl = await uploadPostImage(imageFile, userId);

  const { data, error } = await supabase
    .from("community_posts")
    .insert({ user_id: userId, content, image_url: imageUrl, link_url: linkUrl || null })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function addComment(postId, userId, content) {
  const { data, error } = await supabase
    .from("community_comments")
    .insert({ post_id: postId, user_id: userId, content })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function toggleLike(postId, userId, isLiked) {
  if (isLiked) {
    await supabase.from("community_likes").delete().eq("post_id", postId).eq("user_id", userId);
  } else {
    await supabase.from("community_likes").insert({ post_id: postId, user_id: userId });
  }
}

export async function toggleSave(postId, userId, isSaved) {
  if (isSaved) {
    await supabase.from("community_saves").delete().eq("post_id", postId).eq("user_id", userId);
  } else {
    await supabase.from("community_saves").insert({ post_id: postId, user_id: userId });
  }
}

export async function recordShare(postId, userId) {
  await supabase.from("community_shares").insert({ post_id: postId, user_id: userId || null });
}

export async function getMyReactions(postIds, userId) {
  if (!postIds.length) return { liked: new Set(), saved: new Set() };

  const [{ data: likes }, { data: saves }] = await Promise.all([
    supabase.from("community_likes").select("post_id").eq("user_id", userId).in("post_id", postIds),
    supabase.from("community_saves").select("post_id").eq("user_id", userId).in("post_id", postIds),
  ]);

  return {
    liked: new Set((likes ?? []).map((r) => r.post_id)),
    saved: new Set((saves ?? []).map((r) => r.post_id)),
  };
}
