import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Play, Lock } from "lucide-react";

import { getPlaylistBySlug } from "../api/endpoints";

export default function PlaylistDetailPage() {
  const { slug } = useParams();
  const navigate = useNavigate();

  const [playlist, setPlaylist] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPlaylist();
  }, [slug]);

  const fetchPlaylist = async () => {
    setLoading(true);
    try {
      const res = await getPlaylistBySlug(slug);
      setPlaylist(res.data);
    } catch (err) {
      console.error("Failed to fetch playlist:", err);
      navigate("/");
    } finally {
      setLoading(false);
    }
  };

  const handlePlay = () => {
    navigate(`/player/${slug}`);
  };

  const handleVideoClick = (videoIndex) => {
    navigate(`/player/${slug}?v=${videoIndex}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[#edb843] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!playlist) return null;

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ type: "tween", duration: 0.15, ease: "easeOut" }}
      className="min-h-screen bg-white pb-20"
    >
      {/* Back Button (Floating) */}
      <button
        onClick={() => navigate(-1)}
        className="fixed top-4 left-4 z-50 p-2 bg-black/30 backdrop-blur-sm rounded-full"
      >
        <ArrowLeft className="w-5 h-5 text-white" />
      </button>

      {/* Thumbnail Banner */}
      <div className="relative w-full aspect-video bg-gradient-to-br from-[#002856] to-[#003d83]">
        {playlist.thumbnail_url ? (
          <img
            src={playlist.thumbnail_url}
            alt={playlist.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <span className="text-6xl font-bold text-white/20">
              {playlist.name?.[0]?.toUpperCase()}
            </span>
          </div>
        )}
      </div>

      {/* Playlist Info */}
      <div className="p-4">
        <h1 className="text-2xl font-bold text-[#002856]">{playlist.name}</h1>
        {playlist.description && (
          <p className="text-gray-600 mt-2 text-sm leading-relaxed">
            {playlist.description}
          </p>
        )}

        {/* Play Button */}
        <motion.button
          whileTap={{ scale: 0.98 }}
          onClick={handlePlay}
          className="w-full mt-4 py-3 bg-white border-2 border-[#002856] rounded-xl flex items-center justify-center gap-2"
        >
          <Play className="w-5 h-5 text-[#002856] fill-[#002856]" />
          <span className="font-medium text-[#002856]">Play</span>
        </motion.button>
      </div>

      {/* Episodes List */}
      <div className="px-4">
        <h2 className="text-lg font-bold text-[#002856] mb-4">
          All Episodes ({playlist.videos?.length || 0})
        </h2>

        <div className="space-y-3">
          {playlist.videos?.map((video, idx) => (
            <motion.button
              key={video.video_id}
              whileTap={{ scale: 0.98 }}
              onClick={() => handleVideoClick(idx)}
              className="w-full flex items-center gap-3 p-2 rounded-xl hover:bg-gray-50 transition-colors"
            >
              {/* Thumbnail */}
              <div className="w-20 h-14 bg-gray-100 rounded-lg overflow-hidden shrink-0 relative">
                {video.thumbnail_url ? (
                  <img
                    src={video.thumbnail_url}
                    alt={video.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-[#002856] to-[#003d83]" />
                )}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0 text-left">
                <p className="font-medium text-[#002856] truncate">
                  {video.title}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  {video.view_count || 0} views
                  {video.duration > 0 && ` • ${Math.floor(video.duration / 60)}:${String(video.duration % 60).padStart(2, "0")}`}
                </p>
              </div>

              {/* Lock icon placeholder for premium content (future) */}
              <div className="shrink-0 p-2">
                <Lock className="w-4 h-4 text-gray-300" />
              </div>
            </motion.button>
          ))}
        </div>

        {(!playlist.videos || playlist.videos.length === 0) && (
          <div className="text-center py-8">
            <p className="text-gray-500">No episodes available</p>
          </div>
        )}
      </div>
    </motion.div>
  );
}
