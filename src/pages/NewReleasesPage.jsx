import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";

import VideoCardGrid from "../components/VideoCardGrid";
import { fetchCategories } from "../redux/slices/categorySlice";
import { normalizeCategories } from "../utils/categoryHelpers";

import { getLatestVideos } from "../api/endpoints";

import VideoCardSkeleton from "../components/skeletons/VideoCardSkeleton";

export default function NewReleasesPage() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { items: categoryItems } = useSelector((state) => state.categories);
  const categories = normalizeCategories(categoryItems);
  const [activeFilter, setActiveFilter] = useState("all");
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    dispatch(fetchCategories());
    fetchVideos();
  }, [dispatch]);

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

  const filters = [{ id: "all", name: "All" }, ...categories.slice(0, 4).map((cat) => ({ id: cat.slug, name: cat.name }))];

  const filteredVideos =
    activeFilter === "all"
      ? videos
      : videos.filter(
          (v) =>
            v.category === activeFilter ||
            String(v.category_id) === String(activeFilter)
        );

  if (loading) {
    return (
      <div className="min-h-screen bg-white safe-bottom">
        <div className="sticky top-16 z-30 bg-white border-b border-gray-100 px-4 pt-3 pb-3">
          <div className="flex gap-2">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="h-9 w-20 bg-gray-200 rounded-full animate-pulse"
              />
            ))}
          </div>
        </div>
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
      className="min-h-screen bg-white pb-[calc(80px+env(safe-area-inset-bottom))]"
    >
      {/* Filter chips — sticky below global header (top-16 = 64px) */}
      <div className="sticky top-16 z-30 bg-white border-b border-gray-100 px-4 pt-3 pb-3">
        <div className="flex gap-2 overflow-x-auto hide-scrollbar pb-1">
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
      </div>

      {/* Section header */}
      <div className="px-4 py-3">
        <h2 className="text-lg font-semibold text-[#002856]">Latest</h2>
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
