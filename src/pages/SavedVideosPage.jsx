import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Bookmark } from "lucide-react";

import { getBookmarks } from "../api/endpoints";
import VideoCardGrid from "../components/VideoCardGrid";
import VideoCardSkeleton from "../components/skeletons/VideoCardSkeleton";

export default function SavedVideosPage() {
  const navigate = useNavigate();
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSavedVideos();
  }, []);

  const fetchSavedVideos = async () => {
    try {
      const res = await getBookmarks();
      setVideos(res.data);
    } catch (err) {
      console.error("Failed to fetch saved videos:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ type: "tween", duration: 0.15, ease: "easeOut" }}
      className="min-h-screen bg-white safe-bottom"
    >
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white border-b border-gray-100 p-4">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate(-1)}
            className="p-2 hover:bg-gray-100 rounded-full"
          >
            <ArrowLeft className="w-5 h-5 text-[#002856]" />
          </button>
          <h1 className="text-xl font-bold text-[#002856]">Saved Videos</h1>
        </div>
      </header>

      {/* Content */}
      <main className="p-4">
        {loading ? (
          <div className="grid grid-cols-3 gap-3">
            {[...Array(9)].map((_, i) => (
              <VideoCardSkeleton key={i} />
            ))}
          </div>
        ) : videos.length === 0 ? (
          <div className="text-center py-20">
            <Bookmark className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 text-lg">No saved videos yet</p>
            <p className="text-gray-400 text-sm mt-2">
              Videos you bookmark will appear here
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-3">
            {videos.map((video, idx) => (
              <VideoCardGrid key={video.video_id} video={video} index={idx} />
            ))}
          </div>
        )}
      </main>
    </motion.div>
  );
}
