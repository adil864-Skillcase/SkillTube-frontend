import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ChevronRight } from "lucide-react";
import VideoCardGrid from "./VideoCardGrid";
import { getCategoryById } from "../constants/categories";

export default function CategoryRow({ categoryId, videos }) {
  const navigate = useNavigate();
  const category = getCategoryById(categoryId);

  if (!videos?.length || !category) return null;

  const Icon = category.Icon;

  return (
    <div className="mb-6">
      {/* Header */}
      <div className="flex items-center justify-between px-4 mb-3">
        <div className="flex items-center gap-2">
          <Icon className="w-5 h-5" style={{ color: category.color }} />
          <h2 className="text-lg font-bold text-[#002856]">{category.name}</h2>
        </div>
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={() => navigate(`/category/${categoryId}`)}
          className="flex items-center gap-1 px-3 py-1.5 bg-gray-100 rounded-full text-sm text-[#002856] font-medium"
        >
          View all
          <ChevronRight className="w-4 h-4" />
        </motion.button>
      </div>

      {/* Horizontal scroll */}
      <div className="flex gap-3 overflow-x-auto px-4 pb-2 hide-scrollbar">
        {videos.slice(0, 6).map((video, idx) => (
          <motion.div
            key={video.video_id}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: idx * 0.1 }}
            className="shrink-0 w-28"
          >
            <VideoCardGrid video={video} index={idx} />
          </motion.div>
        ))}
      </div>
    </div>
  );
}
