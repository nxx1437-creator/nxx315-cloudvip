import React, { useState } from "react";
import { Check, Image as ImageIcon, X } from "lucide-react";
import { supabase } from "../lib/supabaseClient";
import {
  EmptyState, ErrorState, GridSkeleton, SectionHeader, StatusBadge,
  fmtDate, fmtNum, useAdminList,
} from "../components/admin/AdminUI";

const loadTasks = () => supabase.from("tasks").select("*").order("created_at", { ascending: false });
const loadPackages = () =>
  supabase.from("redemption_packages").select("*").order("coin_cost", { ascending: true });
const loadPosts = () => supabase.from("posts").select("*").order("created_at", { ascending: false });

const PACKAGE_IMAGES = {
  "card-400": "https://rwglwovohbyqmbbzdvdj.supabase.co/storage/v1/object/public/game_logos/roblox-400.png",
  "vng-40": "https://rwglwovohbyqmbbzdvdj.supabase.co/storage/v1/object/public/game_logos/roblox-40.png",
  "vng-80": "https://rwglwovohbyqmbbzdvdj.supabase.co/storage/v1/object/public/game_logos/roblox-80.png",
  "vng-500": "https://rwglwovohbyqmbbzdvdj.supabase.co/storage/v1/object/public/game_logos/roblox-500.png",
};

// ===== Nhiệm vụ =====
export function TasksTab() {
  const { data: tasks, loading, error, reload } = useAdminList(loadTasks);

  return (
    <div className="space-y-5">
      <SectionHeader title="Nhiệm vụ" description="Quản lý nhiệm vụ kiếm coin" onRefresh={reload} loading={loading} />

      {loading ? (
        <GridSkeleton count={6} className="grid gap-4 md:grid-cols-2 lg:grid-cols-3" />
      ) : error ? (
        <ErrorState message={error} onRetry={reload} />
      ) : tasks.length === 0 ? (
        <EmptyState text="Chưa có nhiệm vụ" />
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {tasks.map((task) => (
            <div key={task.id} className="rounded-2xl border bg-white p-5">
              <div className="mb-3 flex items-start justify-between gap-3">
                <h3 className="font-bold text-slate-900">{task.name || task.title || task.provider || "Nhiệm vụ"}</h3>
                <span className="rounded-full bg-blue-100 px-2.5 py-1 text-xs font-bold text-blue-700">
                  +{fmtNum(task.reward || task.coins || task.reward_coins)}
                </span>
              </div>
              <p className="text-sm text-slate-500">{task.description || "Không có mô tả"}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ===== Gói nạp =====
function PackageSkeleton() {
  return (
    <div className="animate-pulse overflow-hidden rounded-2xl border bg-white">
      <div className="h-40 bg-slate-200" />
      <div className="space-y-3 p-4">
        <div className="h-5 w-32 rounded bg-slate-200" />
        <div className="h-4 w-full rounded bg-slate-200" />
        <div className="h-4 w-2/3 rounded bg-slate-200" />
        <div className="h-8 rounded-lg bg-slate-200" />
      </div>
    </div>
  );
}

export function PackagesTab() {
  const { data: packages, loading, error, reload } = useAdminList(loadPackages);

  return (
    <div className="space-y-5">
      <SectionHeader title="Gói nạp" description="Quản lý các gói Robux" onRefresh={reload} loading={loading} />

      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <PackageSkeleton key={i} />
          ))}
        </div>
      ) : error ? (
        <ErrorState message={error} onRetry={reload} />
      ) : packages.length === 0 ? (
        <EmptyState text="Chưa có gói nạp" />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {packages.map((pkg) => {
            const image = pkg.image_url || pkg.image || PACKAGE_IMAGES[pkg.id];
            return (
              <div
                key={pkg.id}
                className="overflow-hidden rounded-2xl border bg-white transition hover:-translate-y-0.5 hover:shadow-md"
              >
                <div className="flex h-40 items-center justify-center bg-slate-50 p-5">
                  {image ? (
                    <img
                      src={image}
                      alt={pkg.name || pkg.id}
                      className="h-full max-w-full object-contain"
                      onError={(e) => {
                        e.currentTarget.style.display = "none";
                        e.currentTarget.nextElementSibling.style.display = "flex";
                      }}
                    />
                  ) : null}
                  <div
                    className={`${image ? "hidden" : "flex"} h-20 w-20 items-center justify-center rounded-2xl bg-blue-50 text-blue-500`}
                  >
                    <ImageIcon size={32} />
                  </div>
                </div>
                <div className="p-4">
                  <h3 className="font-bold text-slate-900">{pkg.name || pkg.id}</h3>
                  <div className="mt-2 flex items-center justify-between">
                    <span className="text-sm text-slate-500">Robux</span>
                    <span className="font-bold text-blue-600">{fmtNum(pkg.robux || pkg.amount)}</span>
                  </div>
                  <div className="mt-1 flex items-center justify-between">
                    <span className="text-sm text-slate-500">Giá coin</span>
                    <span className="font-bold text-slate-900">{fmtNum(pkg.coin_cost || pkg.coins)}</span>
                  </div>
                  <div className="mt-3 rounded-lg bg-slate-50 px-3 py-2 text-xs text-slate-500">ID: {pkg.id}</div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ===== Bài viết =====
export function PostsTab() {
  const { data: posts, loading, error, reload } = useAdminList(loadPosts);
  const [processingId, setProcessingId] = useState(null);

  const updatePost = async (post, status) => {
    if (processingId) return;
    setProcessingId(post.id);
    const { error: err } = await supabase
      .from("posts")
      .update({ status, updated_at: new Date().toISOString() })
      .eq("id", post.id);
    if (err) alert("Có lỗi: " + err.message);
    else await reload();
    setProcessingId(null);
  };

  return (
    <div className="space-y-5">
      <SectionHeader title="Bài viết" description="Duyệt và quản lý bài viết cộng đồng" onRefresh={reload} loading={loading} />

      {loading ? (
        <GridSkeleton count={4} className="grid gap-4 md:grid-cols-2" />
      ) : error ? (
        <ErrorState message={error} onRetry={reload} />
      ) : posts.length === 0 ? (
        <EmptyState text="Chưa có bài viết" />
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {posts.map((post) => (
            <div key={post.id} className="rounded-2xl border bg-white p-5">
              <div className="mb-3 flex items-start justify-between gap-3">
                <div>
                  <h3 className="font-bold text-slate-900">{post.title || "Bài viết không có tiêu đề"}</h3>
                  <p className="mt-1 text-xs text-slate-400">{fmtDate(post.created_at)}</p>
                </div>
                <StatusBadge status={post.status} />
              </div>

              {post.image_url && (
                <div className="mb-4 overflow-hidden rounded-xl bg-slate-100">
                  <img src={post.image_url} alt="" className="max-h-60 w-full object-cover" />
                </div>
              )}

              <p className="line-clamp-4 whitespace-pre-wrap text-sm text-slate-600">
                {post.content || post.description || "-"}
              </p>

              <div className="mt-4 flex gap-2">
                {post.status !== "approved" && (
                  <button
                    disabled={processingId === post.id}
                    onClick={() => updatePost(post, "approved")}
                    className="flex-1 rounded-xl bg-green-600 py-2.5 font-semibold text-white hover:bg-green-700 disabled:opacity-50"
                  >
                    <Check size={16} className="mr-1 inline" />Duyệt
                  </button>
                )}
                {post.status !== "rejected" && (
                  <button
                    disabled={processingId === post.id}
                    onClick={() => updatePost(post, "rejected")}
                    className="flex-1 rounded-xl bg-red-600 py-2.5 font-semibold text-white hover:bg-red-700 disabled:opacity-50"
                  >
                    <X size={16} className="mr-1 inline" />Từ chối
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
                }
