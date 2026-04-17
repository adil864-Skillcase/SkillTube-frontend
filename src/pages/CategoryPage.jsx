import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, TrendingUp } from "lucide-react";
import * as Icons from "lucide-react";
import { useDispatch, useSelector } from "react-redux";

import { getPlaylistsByCategory, getVideosByCategory } from "../api/endpoints";
import VideoCardGrid from "../components/VideoCardGrid";
import { fetchCategories } from "../redux/slices/categorySlice";
import { normalizeCategories, findCategoryBySlug } from "../utils/categoryHelpers";

export default function CategoryPage() {
  const { categoryId } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { items: categoryItems } = useSelector((state) => state.categories);
  const categories = normalizeCategories(categoryItems);
  const category = findCategoryBySlug(categories, categoryId);

  const [playlists, setPlaylists] = useState([]);
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPlaylist, setSelectedPlaylist] = useState(null);

  useEffect(() => {
    dispatch(fetchCategories());
  }, [dispatch]);

  useEffect(() => {
    if (!category) {
      return;
    }
    fetchData();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [categoryId, category?.id, category?.category_id]); 

  useEffect(() => {
    if (categoryItems.length > 0 && !category) {
      navigate("/");
    }
  }, [categoryItems.length, category?.id, navigate]);

  const fetchData = async () => {
    if (!category || (!category.id && !category.category_id)) return;
    const catId = category.category_id || category.id;
    
    setLoading(true);
    try {
      const [playlistRes, videoRes] = await Promise.all([
        getPlaylistsByCategory(categoryId), // Pass slug for legacy playlist compatibility
        getVideosByCategory(catId, 10), // Pass numeric ID for the rigid video schema
      ]);
      setPlaylists(playlistRes.data);
      setVideos(videoRes.data);
    } catch (err) {
      console.error("Failed to fetch category data:", err);
    } finally {
      setLoading(false);
    }
  };

  if (!category) return null;

  const IconComponent = category.Icon || Icons[category.icon_name] || Icons.Box;

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ type: "tween", duration: 0.15, ease: "easeOut" }}
      className="min-h-screen bg-white"
    >
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white border-b border-gray-100">
        <div className="flex items-center gap-4 p-4">
          <button
            onClick={() => navigate(-1)}
            className="p-2 hover:bg-gray-100 rounded-full"
          >
            <ArrowLeft className="w-5 h-5 text-[#002856]" />
          </button>
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{ backgroundColor: `${category.color || '#edb843'}15` }}
            >
              {IconComponent && (
                <IconComponent className="w-5 h-5" style={{ color: category.color || '#002856' }} />
              )}
            </div>
            <h1 className="text-xl font-bold text-[#002856]">{category.name}</h1>
          </div>
        </div>
      </header>

      {/* Playlist Pills */}
      {playlists.length > 0 && (
        <div className="px-4 py-3 border-b border-gray-50 bg-gray-50/50">
          <h2 className="text-sm font-bold text-[#002856] mb-2 px-1">Playlists</h2>
          <div className="overflow-x-auto hide-scrollbar pb-1">
            <div className="flex gap-2">
              {playlists.map((playlist) => (
                <motion.button
                  key={playlist.playlist_id}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => navigate(`/playlist/${playlist.slug}`)}
                  className={`shrink-0 px-4 py-2 rounded-full text-sm font-medium border transition-colors ${
                    selectedPlaylist === playlist.playlist_id
                      ? "bg-[#002856] text-white border-[#002856]"
                      : "bg-white text-[#002856] border-gray-200 hover:border-[#002856]"
                  }`}
                >
                  {playlist.name}
                </motion.button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="flex justify-center py-12">
          <div className="w-8 h-8 border-2 border-[#edb843] border-t-transparent rounded-full animate-spin" />
        </div>
      )}

      {/* Top Videos Section */}
      {!loading && (
        <main className="p-4">
          {/* Section Header */}
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="w-5 h-5 text-[#edb843]" />
            <h2 className="text-lg font-bold text-[#002856]">
              Top 10 videos in {category.name}
            </h2>
          </div>

          {/* Video Grid */}
          {videos.length > 0 ? (
            <div className="grid grid-cols-3 gap-x-2 gap-y-4">
              {videos.map((video, idx) => (
                <div key={video.video_id} className="relative mt-1 ml-2">
                  {/* Ranking Number */}
                  <div className="absolute -bottom-2 -left-4 z-10 pointer-events-none">
                    <span
                      className="text-[60px] font-black text-white tracking-tighter leading-none"
                      style={{
                        WebkitTextStroke: "2.5px #002856",
                        textShadow: "2px 3px 6px rgba(0,0,0,0.5)",
                      }}
                    >
                      {idx + 1}
                    </span>
                  </div>
                  <VideoCardGrid video={video} index={idx} />
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-500">No videos in this category yet</p>
            </div>
          )}
        </main>
      )}
    </motion.div>
  );
}
