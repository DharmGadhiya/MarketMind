const SkeletonLoader = () => {
  return (
    <div className="w-full animate-pulse space-y-8 py-6">
      {/* HEADER SKELETON */}
      <div className="flex flex-col gap-4 border-b border-border-custom pb-6 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <div className="h-16 w-16 rounded-2xl bg-black/[0.04] dark:bg-white/[0.04]" />
          <div className="space-y-2.5">
            <div className="h-7 w-48 rounded-lg bg-black/[0.06] dark:bg-white/[0.06]" />
            <div className="flex items-center gap-2">
              <div className="h-4 w-20 rounded bg-black/[0.04] dark:bg-white/[0.04]" />
              <div className="h-4 w-4 rounded-full bg-black/[0.04] dark:bg-white/[0.04]" />
              <div className="h-4 w-24 rounded bg-black/[0.04] dark:bg-white/[0.04]" />
            </div>
          </div>
        </div>
        <div className="flex flex-col items-start gap-1 sm:items-end">
          <div className="h-8 w-32 rounded-lg bg-black/[0.06] dark:bg-white/[0.06]" />
          <div className="h-4 w-24 rounded bg-black/[0.04] dark:bg-white/[0.04]" />
        </div>
      </div>

      {/* MAIN LAYOUT SKELETON */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_320px]">
        {/* LEFT COLUMN */}
        <div className="space-y-8">
          {/* CHART */}
          <div className="rounded-2xl border border-border-custom bg-bg-1 p-5 shadow-sm space-y-4">
            <div className="flex justify-between items-center pb-2">
              <div className="h-4 w-32 rounded bg-black/[0.05] dark:bg-white/[0.05]" />
              <div className="flex gap-1.5">
                {Array.from({ length: 8 }).map((_, i) => (
                  <div key={i} className="h-7 w-9 rounded-lg bg-black/[0.04] dark:bg-white/[0.04]" />
                ))}
              </div>
            </div>
            <div className="h-[400px] w-full rounded-xl bg-black/[0.03] dark:bg-white/[0.03]" />
          </div>

          {/* DESCRIPTION */}
          <div className="rounded-2xl border border-border-custom bg-bg-1 p-5 shadow-sm space-y-3">
            <div className="h-5 w-40 rounded bg-black/[0.05] dark:bg-white/[0.05]" />
            <div className="space-y-2">
              <div className="h-3.5 w-full rounded bg-black/[0.03] dark:bg-white/[0.03]" />
              <div className="h-3.5 w-full rounded bg-black/[0.03] dark:bg-white/[0.03]" />
              <div className="h-3.5 w-11/12 rounded bg-black/[0.03] dark:bg-white/[0.03]" />
              <div className="h-3.5 w-4/5 rounded bg-black/[0.03] dark:bg-white/[0.03]" />
            </div>
          </div>

          {/* GRAPHS PLACEHOLDER / ADDITIONAL CONTENT */}
          <div className="rounded-2xl border border-border-custom bg-bg-1 p-5 shadow-sm space-y-4">
            <div className="h-5 w-48 rounded bg-black/[0.05] dark:bg-white/[0.05]" />
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="h-24 rounded-xl bg-black/[0.03] dark:bg-white/[0.03]" />
              ))}
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN */}
        <div className="space-y-6">
          {/* PERFORMANCE CARD */}
          <div className="rounded-2xl border border-border-custom bg-bg-1 p-5 shadow-sm space-y-4">
            <div className="h-5 w-32 rounded bg-black/[0.05] dark:bg-white/[0.05]" />
            <div className="space-y-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="space-y-1.5">
                  <div className="flex justify-between">
                    <div className="h-3 w-16 rounded bg-black/[0.04] dark:bg-white/[0.04]" />
                    <div className="h-3 w-12 rounded bg-black/[0.04] dark:bg-white/[0.04]" />
                  </div>
                  <div className="h-2 w-full rounded bg-black/[0.02] dark:bg-white/[0.02]" />
                </div>
              ))}
            </div>
          </div>

          {/* FUNDAMENTALS CARD */}
          <div className="rounded-2xl border border-border-custom bg-bg-1 p-5 shadow-sm space-y-4">
            <div className="h-5 w-32 rounded bg-black/[0.05] dark:bg-white/[0.05]" />
            <div className="grid grid-cols-2 gap-x-6 gap-y-4">
              {Array.from({ length: 10 }).map((_, i) => (
                <div key={i} className="space-y-1">
                  <div className="h-2.5 w-16 rounded bg-black/[0.04] dark:bg-white/[0.04]" />
                  <div className="h-4 w-20 rounded bg-black/[0.05] dark:bg-white/[0.05]" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SkeletonLoader;
