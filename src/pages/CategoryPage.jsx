import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, TrendingUp } from "lucide-react";

import { getPlaylistsByCategory, getVideosByCategory } from "../api/endpoints";
import { getCategoryById } from "../constants/categories";
import VideoCardGrid from "../components/VideoCardGrid";

export default function CategoryPage() {
  const { categoryId } = useParams();
  const navigate = useNavigate();
  const category = getCategoryById(categoryId);

  const [playlists, setPlaylists] = useState([]);
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPlaylist, setSelectedPlaylist] = useState(null);

  useEffect(() => {
    if (!category) {
      navigate("/");
      return;
    }
    fetchData();
  }, [categoryId]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [playlistRes, videoRes] = await Promise.all([
        getPlaylistsByCategory(categoryId),
        getVideosByCategory(categoryId, 10),
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
              style={{ backgroundColor: `${category.color}15` }}
            >
              <category.Icon className="w-5 h-5" style={{ color: category.color }} />
            </div>
            <h1 className="text-xl font-bold text-[#002856]">{category.name}</h1>
          </div>
        </div>
      </header>

      {/* Playlist Pills */}
      {playlists.length > 0 && (
        <div className="px-4 py-3 overflow-x-auto">
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
              Top 10 in {category.name}
            </h2>
          </div>

          {/* Video Grid */}
          {videos.length > 0 ? (
            <div className="grid grid-cols-2 gap-3">
              {videos.map((video, idx) => (
                <div key={video.video_id} className="relative">
                  {/* Ranking Number */}
                  <div className="absolute bottom-2 left-2 z-10">
                    <span
                      className="text-4xl font-black text-white drop-shadow-lg"
                      style={{
                        textShadow: "2px 2px 4px rgba(0,0,0,0.5)",
                        WebkitTextStroke: "1px rgba(0,0,0,0.3)",
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
