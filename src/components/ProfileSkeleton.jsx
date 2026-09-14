import React from "react";

export default function ProfileSkeleton() {
  return (
    <div className="space-y-5">
      {/* Header */}
      <div>
        <div className="h-8 w-32 rounded skeleton-shimmer" />
        <div className="mt-2 h-4 w-64 rounded skeleton-shimmer" />
      </div>

      {/* Profile card */}
      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-[0_1px_2px_rgba(0,0,0,0.04)] dark:border-slate-800 dark:bg-slate-900">
        <div className="flex flex-col items-center">
          <div className="h-24 w-24 rounded-full skeleton-shimmer" />
          <div className="mt-3 h-3 w-48 rounded skeleton-shimmer" />
          <div className="mt-4 h-6 w-32 rounded skeleton-shimmer" />
          <div className="mt-2 h-3 w-40 rounded skeleton-shimmer" />
          <div className="mt-3 flex items-center gap-2">
            <div className="h-6 w-16 rounded skeleton-shimmer" />
            <div className="h-6 w-20 rounded skeleton-shimmer" />
          </div>
          <div className="mt-4 w-full max-w-xs">
            <div className="h-3 w-full rounded skeleton-shimmer" />
            <div className="mt-1.5 h-1.5 w-full rounded-full skeleton-shimmer" />
          </div>
          <div className="mt-4 h-9 w-40 rounded skeleton-shimmer" />
        </div>
      </div>

      {/* Settings groups */}
      {Array.from({ length: 2 }).map((_, gi) => (
        <div key={gi}>
          <div className="mb-2 h-3 w-24 rounded skeleton-shimmer" />
          <div className="overflow-hidden rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
            {Array.from({ length: 3 }).map((_, ri) => (
              <div
                key={ri}
                className={`flex items-center justify-between px-4 py-3.5 ${
                  ri < 2 ? "border-b border-slate-100 dark:border-slate-800" : ""
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="h-9 w-9 rounded-lg skeleton-shimmer" />
                  <div>
                    <div className="h-3.5 w-28 rounded skeleton-shimmer" />
                    <div className="mt-1.5 h-2.5 w-40 rounded skeleton-shimmer" />
                  </div>
                </div>
                <div className="h-4 w-4 rounded skeleton-shimmer" />
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
                    }
