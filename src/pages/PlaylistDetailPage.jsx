import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Bookmark, Share2 } from "lucide-react";
import toast from "react-hot-toast";

import { getPlaylistBySlug } from "../api/endpoints";
import VideoCardGrid from "../components/VideoCardGrid";
import { playSound } from "../utils/sounds";

const SAVED_PLAYLISTS_KEY = "skilltube_saved_playlists";

function getSavedPlaylists() {
  try {
    return JSON.parse(localStorage.getItem(SAVED_PLAYLISTS_KEY) || "[]");
  } catch {
    return [];
  }
}

function toggleSavedPlaylist(playlistId) {
  const saved = getSavedPlaylists();
  const idx = saved.indexOf(playlistId);
  if (idx === -1) {
    saved.push(playlistId);
    localStorage.setItem(SAVED_PLAYLISTS_KEY, JSON.stringify(saved));
    return true;
  } else {
    saved.splice(idx, 1);
    localStorage.setItem(SAVED_PLAYLISTS_KEY, JSON.stringify(saved));
    return false;
  }
}

export default function PlaylistDetailPage() {
  const { slug } = useParams();
  const navigate = useNavigate();

  const [playlist, setPlaylist] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    fetchPlaylist();
  }, [slug]);

  const fetchPlaylist = async () => {
    setLoading(true);
    try {
      const res = await getPlaylistBySlug(slug);
      setPlaylist(res.data);
      const saved = getSavedPlaylists();
      setIsSaved(saved.includes(res.data.playlist_id));
    } catch (err) {
      console.error("Failed to fetch playlist:", err);
      navigate("/");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = () => {
    if (!playlist) return;
    playSound("tap");
    const nowSaved = toggleSavedPlaylist(playlist.playlist_id);
    setIsSaved(nowSaved);
    toast.success(nowSaved ? "Playlist saved" : "Removed from saved");
  };

  const handleShare = async () => {
    playSound("tap");
    const url = `${window.location.origin}/playlist/${slug}`;
    if (navigator.share) {
      try {
        await navigator.share({
          title: playlist?.name || "SkillTube Playlist",
          url,
        });
      } catch {
        // user dismissed — no error needed
      }
    } else {
      try {
        await navigator.clipboard.writeText(url);
        toast.success("Link copied to clipboard");
      } catch {
        toast.error("Could not copy link");
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[#002856] border-t-transparent rounded-full animate-spin" />
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
      className="min-h-screen w-full bg-white flex flex-col justify-start items-start overflow-x-hidden"
    >
      {/* Back header bar */}
      <div className="w-full px-4 pt-5 pb-3 bg-stone-50 flex items-center sticky top-0 z-40">
        <button
          onClick={() => {
            playSound("tap");
            navigate(-1);
          }}
          className="flex items-center gap-2 p-1 -ml-1 active:opacity-70 transition-opacity"
        >
          <ArrowLeft className="w-5 h-5 text-neutral-900" />
          <span className="text-neutral-900 text-sm font-semibold font-['Poppins'] leading-6">
            Back
          </span>
        </button>
      </div>

      {/* Playlist Meta */}
      <div className="w-full px-4 pt-3 pb-6 flex flex-col gap-2.5">
        <div className="w-full flex justify-start items-start gap-5">
          {/* Thumbnail */}
          <div className="w-28 aspect-[9/16] shrink-0 relative rounded-xl overflow-hidden shadow-md">
            {playlist.thumbnail_url ? (
              <img
                src={playlist.thumbnail_url}
                alt={playlist.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-[#002856] to-[#003d83]" />
            )}
          </div>

          {/* Info + Actions */}
          <div className="flex-1 flex flex-col gap-3 pt-1">
            <div className="flex flex-col gap-1">
              <h1 className="text-neutral-900 text-base font-semibold font-['Poppins'] leading-snug line-clamp-2">
                {playlist.name}
              </h1>
              {playlist.description && (
                <p className="opacity-60 text-black text-xs font-normal font-['Poppins'] leading-4 line-clamp-3">
                  {playlist.description}
                </p>
              )}
              <p className="text-xs text-gray-400 font-['Poppins'] mt-0.5">
                {playlist.videos?.length || 0} videos
              </p>
            </div>

            {/* Action buttons — Save & Share only */}
            <div className="flex items-center gap-2">
              <button
                onClick={handleSave}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-2xl border transition-colors ${
                  isSaved
                    ? "bg-[#002856] border-[#002856] text-white"
                    : "bg-neutral-100 border-transparent text-neutral-500"
                }`}
              >
                <Bookmark
                  className="w-3.5 h-3.5"
                  strokeWidth={2.5}
                  fill={isSaved ? "currentColor" : "none"}
                />
                <span className="text-xs font-medium font-['Poppins']">
                  {isSaved ? "Saved" : "Save"}
                </span>
              </button>

              <button
                onClick={handleShare}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-neutral-100 rounded-2xl text-neutral-500 transition-colors active:bg-neutral-200"
              >
                <Share2 className="w-3.5 h-3.5" strokeWidth={2.5} />
                <span className="text-xs font-medium font-['Poppins']">Share</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Videos grid */}
      <div className="w-full px-4 pt-2 pb-12">
        {!playlist.videos || playlist.videos.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 font-['Poppins']">No videos in this playlist yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-1.5">
            {playlist.videos.map((video, idx) => (
              <VideoCardGrid
                key={video.video_id}
                video={{ ...video, playlist_slug: slug }}
                index={idx}
              />
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
}
