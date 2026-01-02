import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Play } from "lucide-react";

export default function VideoCardGrid({ video, index = 0 }) {
  const navigate = useNavigate();

  return (
    <motion.button
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        delay: index * 0.03,
        type: "spring",
        stiffness: 100,
      }}
      whileHover={{ scale: 1.02, y: -4 }}
      whileTap={{ scale: 0.98 }}
      onClick={() =>
        navigate(`/player/${video.playlist_slug}?v=${video.video_id}`)
      }
      className="video-card w-full h-40 relative group"
    >
      {video.thumbnail_url ? (
        <img
          src={video.thumbnail_url}
          alt={video.title}
          className="w-full h-full object-cover"
          loading="lazy"
        />
      ) : (
        <div className="w-full h-full bg-linear-to-br from-[#002856] to-[#003d83]" />
      )}

      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-linear-to-t from-black/80 via-transparent to-transparent" />

      {/* Play icon on hover */}
      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
        <div className="w-12 h-12 bg-[#edb843] rounded-full flex items-center justify-center">
          <Play className="w-6 h-6 text-[#002856] fill-[#002856]" />
        </div>
      </div>

      {/* Title */}
      <div className="absolute bottom-0 left-0 right-0 p-3">
        <h3 className="text-sm font-semibold text-white line-clamp-2 leading-tight">
          {video.title}
        </h3>
      </div>
    </motion.button>
  );
}
