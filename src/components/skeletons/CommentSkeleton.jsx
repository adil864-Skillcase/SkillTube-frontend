export default function CommentSkeleton() {
  return (
    <div className="flex gap-3 animate-pulse">
      <div className="w-8 h-8 bg-gray-200 rounded-full shrink-0" />
      <div className="flex-1 space-y-2">
        <div className="h-4 w-20 bg-gray-200 rounded" />
        <div className="h-3 w-full bg-gray-200 rounded" />
        <div className="h-3 w-3/4 bg-gray-200 rounded" />
      </div>
    </div>
  );
}
