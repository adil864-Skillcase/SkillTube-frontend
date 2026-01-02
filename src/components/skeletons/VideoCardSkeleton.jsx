export default function VideoCardSkeleton() {
  return (
    <div className="w-full aspect-9/16 bg-gray-100 rounded-2xl overflow-hidden">
      <div className="w-full h-full bg-linear-to-r from-gray-100 via-gray-200 to-gray-100 animate-shimmer bg-size-[200%_100%]" />
    </div>
  );
}
