import { motion } from "framer-motion";
import { Play, ChevronRight } from "lucide-react";

export default function LibraryOverlay({
  videos,
  playlist,
  currentIndex,
  onVideoSelect,
  style,
}) {
  const formatDate = (date) => {
    return new Date(date).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
    });
  };

  const formatDuration = (seconds) => {
    if (!seconds) return "";
    return `${Math.floor(seconds / 60)} mins`;
  };

  return (
    <motion.div
      style={style}
      className="absolute top-0 left-0 right-0 bottom-0 z-30 overflow-hidden flex flex-col"
    >
      {/* Invisible swipe trigger zone - touchable but not visible */}
      <div className="py-4 flex justify-center cursor-grab active:cursor-grabbing">
        {/* Very subtle handle - nearly invisible */}
        <div className="w-10 h-1 bg-white/10 rounded-full" />
      </div>

      {/* Content container - this has the visible background */}
      <div className="flex-1 flex flex-col bg-gray-900 rounded-t-2xl shadow-2xl overflow-hidden">
        {/* Visible drag handle inside content */}
        <div className="pt-3 pb-2 flex justify-center">
          <div className="w-10 h-1 bg-gray-600 rounded-full" />
        </div>

        {/* Header */}
        <div className="px-4 py-2 flex items-center gap-3 shrink-0 border-b border-gray-800">
          <div className="w-12 h-12 bg-gray-800 rounded-xl overflow-hidden shrink-0">
            {playlist?.thumbnail_url && (
              <img
                src={playlist.thumbnail_url}
                alt=""
                className="w-full h-full object-cover"
              />
            )}
          </div>
          <div>
            <h2 className="font-bold text-white flex items-center gap-1">
              {playlist?.name}
              <ChevronRight className="w-4 h-4 text-gray-500" />
            </h2>
            <p className="text-sm text-gray-400">{videos.length} Videos</p>
          </div>
        </div>

        {/* Episodes list */}
        <div className="flex-1 overflow-y-auto px-4 pb-20 hide-scrollbar overscroll-contain">
        <h3 className="font-semibold text-white mb-3 mt-2">All episodes</h3>
        {videos.map((video, index) => (
          <motion.button
            key={video.video_id}
            whileTap={{ scale: 0.98 }}
            onClick={() => onVideoSelect(index)}
            className={`w-full flex items-center gap-3 p-3 rounded-xl mb-2 transition-colors ${
              index === currentIndex ? "bg-accent/10" : "hover:bg-gray-800/50"
            }`}
          >
            {/* Thumbnail */}
            <div className="w-16 h-16 bg-gray-800 rounded-xl overflow-hidden shrink-0 relative">
              {video.thumbnail_url ? (
                <img
                  src={video.thumbnail_url}
                  alt=""
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-linear-to-br from-gray-700 to-gray-800" />
              )}
              {index === currentIndex && (
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                  <div className="w-4 h-4 bg-accent rounded-full animate-pulse" />
                </div>
              )}
            </div>

            {/* Info */}
            <div className="flex-1 text-left">
              <h4 className={`text-sm font-medium line-clamp-2 ${index === currentIndex ? "text-accent" : "text-white"}`}>
                {video.title}
              </h4>
              <p className="text-xs text-gray-500 mt-1">
                {formatDate(video.created_at)}
                {video.duration > 0 && ` • ${formatDuration(video.duration)}`}
              </p>
            </div>

            {/* Play button */}
            {index !== currentIndex && (
              <div className="w-8 h-8 bg-gray-800 rounded-full flex items-center justify-center shrink-0">
                <Play className="w-3 h-3 text-white fill-white" />
              </div>
            )}
        </motion.button>
        ))}
        </div>
      </div>
    </motion.div>
  );
}
