import React from "react";

export default function PageSkeleton() {
  return (
    <div className="min-h-screen bg-[#FAFBFC] px-4 py-5">
      <style>{`
        @keyframes shimmer {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
        .skeleton-shimmer {
          background-image: linear-gradient(90deg, #f1f5f9 0%, #e2e8f0 50%, #f1f5f9 100%);
          background-size: 200% 100%;
          animation: shimmer 1.5s infinite linear;
        }
      `}</style>

      <div className="mx-auto max-w-md md:max-w-5xl space-y-4">
        {/* Header skeleton */}
        <div className="h-12 w-full rounded-2xl skeleton-shimmer" />

        {/* Hero card */}
        <div className="rounded-3xl border border-white bg-white p-5 shadow-sm">
          <div className="h-6 w-48 rounded-full skeleton-shimmer" />
          <div className="mt-4 flex items-center gap-3">
            <div className="h-14 w-14 rounded-2xl skeleton-shimmer" />
            <div className="flex-1">
              <div className="h-6 w-40 rounded skeleton-shimmer" />
              <div className="mt-2 h-3 w-32 rounded skeleton-shimmer" />
            </div>
          </div>
          <div className="mt-4 grid grid-cols-2 gap-2.5">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-20 rounded-xl skeleton-shimmer" />
            ))}
          </div>
        </div>

        {/* Search skeleton */}
        <div className="h-12 w-full rounded-full skeleton-shimmer" />

        {/* Cards skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="rounded-2xl border border-white bg-white p-4 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="h-11 w-11 rounded-xl skeleton-shimmer" />
                <div className="h-4 w-24 rounded skeleton-shimmer" />
              </div>
              <div className="mt-3 h-12 w-full rounded-xl skeleton-shimmer" />
              <div className="mt-3 h-2 w-full rounded-full skeleton-shimmer" />
              <div className="mt-4 h-11 w-full rounded-full skeleton-shimmer" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
