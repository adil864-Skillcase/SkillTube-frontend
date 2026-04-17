import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Play } from "lucide-react";
import { playSound } from "../utils/sounds";

export default function VideoCardGrid({ video, index = 0 }) {
  const navigate = useNavigate();

  return (
    <motion.button
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{
        delay: index * 0.05,
        type: "spring",
        stiffness: 200,
        damping: 15,
      }}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={() => {
        playSound("tap");
        navigate(`/player/${video.playlist_slug}?v=${index}`);
      }}
      className="video-card w-full aspect-[9/16] relative rounded-lg overflow-hidden group flex-shrink-0"
    >
      {video.thumbnail_url ? (
        <img
          src={video.thumbnail_url}
          alt={video.title}
          className="w-full h-full object-cover"
          loading="lazy"
        />
      ) : (
        <div className="w-full h-full bg-gradient-to-br from-[#002856] to-[#003d83]" />
      )}

      {/* Subtle bottom gradient to make text readable */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-80" />

      {/* Play icon centered on hover */}
      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
        <div className="w-10 h-10 bg-white/20 backdrop-blur rounded-full flex items-center justify-center">
          <Play className="w-5 h-5 text-white fill-white ml-0.5" />
        </div>
      </div>

      {/* Duration badge or view count (optional, adds micro detail) */}
      <div className="absolute top-1.5 right-1.5 px-1.5 py-0.5 bg-black/60 backdrop-blur rounded text-[9px] text-white font-medium">
        {video.view_count || 0} views
      </div>

      {/* Title */}
      <div className="absolute bottom-0 left-0 right-0 p-2">
        <h3 className="text-[11px] font-semibold text-white line-clamp-2 leading-tight text-left">
          {video.title}
        </h3>
      </div>
    </motion.button>
  );
}
