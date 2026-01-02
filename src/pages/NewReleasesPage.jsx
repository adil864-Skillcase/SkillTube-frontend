import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Search } from "lucide-react";
import { useNavigate } from "react-router-dom";

import VideoCardGrid from "../components/VideoCardGrid";
import { CATEGORIES } from "../constants/categories";

import { getLatestVideos } from "../api/endpoints";

//Skeletons
import VideoCardSkeleton from "../components/skeletons/VideoCardSkeleton";

export default function NewReleasesPage() {
  const navigate = useNavigate();
  const [activeFilter, setActiveFilter] = useState("all");
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchVideos();
  }, []);

  const fetchVideos = async () => {
    try {
      const res = await getLatestVideos(30);
      setVideos(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const filters = [{ id: "all", name: "All" }, ...CATEGORIES.slice(0, 4)];

  const filteredVideos =
    activeFilter === "all"
      ? videos
      : videos.filter((v) => v.category === activeFilter);

  if (loading) {
    return (
      <div className="min-h-screen bg-white safe-bottom">
        <header className="sticky top-0 z-40 bg-white border-b border-gray-100 p-4">
          <div className="h-8 w-32 bg-gray-200 rounded animate-pulse mb-4" />
          <div className="flex gap-2">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="h-10 w-20 bg-gray-200 rounded-full animate-pulse"
              />
            ))}
          </div>
        </header>
        <main className="px-4 pb-4 pt-4">
          <div className="grid grid-cols-3 gap-3">
            {[...Array(9)].map((_, i) => (
              <VideoCardSkeleton key={i} />
            ))}
          </div>
        </main>
      </div>
    );
  }

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
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold text-[#002856]">New Releases</h1>
          <button
            onClick={() => navigate("/search")}
            className="p-2 bg-gray-100 rounded-full"
          >
            <Search className="w-5 h-5 text-[#002856]" />
          </button>
        </div>

        {/* Filter chips */}
        <div className="flex gap-2 overflow-x-auto hide-scrollbar pb-2">
          {filters.map((filter) => (
            <motion.button
              key={filter.id}
              whileTap={{ scale: 0.95 }}
              onClick={() => setActiveFilter(filter.id)}
              className={`px-4 py-2 rounded-full whitespace-nowrap text-sm font-medium transition-all border ${
                activeFilter === filter.id
                  ? "bg-[#002856] text-white border-[#002856]"
                  : "bg-white text-[#002856] border-gray-200"
              }`}
            >
              {filter.name}
            </motion.button>
          ))}
        </div>
      </header>

      {/* Section header */}
      <div className="px-4 py-3">
        <h2 className="text-lg font-semibold text-[#002856]">Today</h2>
      </div>

      {/* Video grid */}
      <main className="px-4 pb-4">
        <div className="grid grid-cols-3 gap-3">
          {filteredVideos.map((video, idx) => (
            <VideoCardGrid key={video.video_id} video={video} index={idx} />
          ))}
        </div>

        {filteredVideos.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">No videos in this category</p>
          </div>
        )}
      </main>
    </motion.div>
  );
}
