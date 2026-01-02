import { useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { TrendingUp } from "lucide-react";

import Header from "../components/Header";
import SearchBar from "../components/SearchBar";
import CategoryGrid from "../components/CategoryGrid";
import CategoryRow from "../components/CategoryRow";
import VideoCardGrid from "../components/VideoCardGrid";

import { fetchPlaylists } from "../redux/slices/playlistSlice";
import { CATEGORIES } from "../constants/categories";

// Skeletons
import PlaylistRowSkeleton from "../components/skeletons/PlaylistRowSkeleton";

export default function HomePage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { items: playlists, loading } = useSelector((state) => state.playlists);

  useEffect(() => {
    dispatch(fetchPlaylists());
  }, [dispatch]);

  // Get all videos with playlist slug
  const allVideos = useMemo(() => {
    return playlists.flatMap((p) =>
      (p.videos || []).map((v) => ({ ...v, playlist_slug: p.slug }))
    );
  }, [playlists]);

  // Get top 6 videos
  const topVideos = useMemo(() => allVideos.slice(0, 6), [allVideos]);

  // Group videos by category
  const videosByCategory = useMemo(() => {
    const grouped = {};
    allVideos.forEach((video) => {
      if (video.category) {
        if (!grouped[video.category]) {
          grouped[video.category] = [];
        }
        grouped[video.category].push(video);
      }
    });
    return grouped;
  }, [allVideos]);

  // Get categories that have videos (in original order)
  const categoriesWithVideos = useMemo(() => {
    return CATEGORIES.filter((cat) => videosByCategory[cat.id]?.length > 0);
  }, [videosByCategory]);

  const handleCategorySelect = (category) => {
    navigate(`/category/${category.id}`);
  };

  if (loading && playlists.length === 0) {
    return (
      <div className="min-h-screen bg-white safe-bottom">
        <Header />
        <main className="pb-4">
          <div className="px-4 mb-6 mt-4">
            <div className="h-12 bg-gray-200 rounded-xl animate-pulse" />
          </div>
          <PlaylistRowSkeleton />
          <PlaylistRowSkeleton />
          <PlaylistRowSkeleton />
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
      <Header />

      <main className="pb-24">
        {/* Search */}
        <div className="px-4 mb-6 mt-4">
          <SearchBar placeholder="Search for Germany tips..." />
        </div>

        {/* Categories Grid */}
        <div className="px-4 mb-6">
          <CategoryGrid onSelect={handleCategorySelect} />
        </div>

        {/* Top 6 Videos */}
        {topVideos.length > 0 && (
          <div className="mb-6">
            <div className="flex items-center gap-2 px-4 mb-3">
              <TrendingUp className="w-5 h-5 text-[#edb843]" />
              <h2 className="text-lg font-bold text-[#002856]">Top Videos</h2>
            </div>
            <div className="flex gap-3 overflow-x-auto px-4 pb-2 hide-scrollbar">
              {topVideos.map((video, idx) => (
                <motion.div
                  key={video.video_id}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  className="shrink-0 w-28"
                >
                  <VideoCardGrid video={video} index={idx} />
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {/* Categories with Videos */}
        {categoriesWithVideos.map((category) => (
          <CategoryRow
            key={category.id}
            categoryId={category.id}
            videos={videosByCategory[category.id]}
          />
        ))}

        {allVideos.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">No content available yet</p>
          </div>
        )}
      </main>
    </motion.div>
  );
}

