export default function SkeletonGrid({ count = 6 }: { count?: number }) {
  return (
    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="relative flex flex-col justify-between overflow-hidden rounded-[24px] border border-[#1f222a] bg-[#0c0d12] p-5 h-[340px]"
        >
          {/* Shimmer sweep effect */}
          <div className="absolute inset-0 -translate-x-full animate-[shimmer_1.8s_infinite] bg-gradient-to-r from-transparent via-white/[0.06] to-transparent pointer-events-none" />

          {/* Top banner placeholder */}
          <div className="h-[150px] w-full rounded-2xl bg-white/[0.03] border border-white/[0.04]" />

          {/* Body items */}
          <div className="mt-4 space-y-3">
            <div className="flex items-center gap-2">
              <div className="h-3 w-16 rounded-md bg-white/[0.05]" />
              <div className="h-3 w-12 rounded-md bg-white/[0.04]" />
            </div>
            <div className="h-5 w-3/4 rounded-md bg-white/[0.07]" />
            <div className="h-3.5 w-1/2 rounded-md bg-white/[0.03]" />
          </div>

          {/* Footer row */}
          <div className="mt-5 flex items-center justify-between border-t border-[#181a22] pt-3">
            <div className="h-6 w-20 rounded-md bg-white/[0.06]" />
            <div className="h-4 w-16 rounded-md bg-white/[0.04]" />
          </div>
        </div>
      ))}
    </div>
  );
}
