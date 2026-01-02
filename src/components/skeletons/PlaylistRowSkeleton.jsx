export default function PlaylistRowSkeleton() {
  return (
    <div className="mb-6">
      {/* Header skeleton */}
      <div className="flex items-center justify-between px-4 mb-3">
        <div className="h-6 w-32 bg-gray-200 rounded animate-pulse" />
        <div className="h-8 w-20 bg-gray-200 rounded-full animate-pulse" />
      </div>

      {/* Cards skeleton */}
      <div className="flex gap-3 overflow-x-auto px-4 pb-2 hide-scrollbar">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="shrink-0 w-32">
            <div className="w-full aspect-9/16 bg-gray-200 rounded-2xl animate-pulse" />
          </div>
        ))}
      </div>
    </div>
  );
}
