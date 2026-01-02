import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Plus,
  Video,
  ListMusic,
  Trash2,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import toast from "react-hot-toast";

import {
  getPlaylists,
  getVideosByPlaylist,
  deleteVideo,
  deletePlaylist,
} from "../../api/endpoints";
import ConfirmDialog from "../../components/ConfirmDialog";

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [playlists, setPlaylists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedPlaylist, setExpandedPlaylist] = useState(null);
  const [playlistVideos, setPlaylistVideos] = useState({});
  const [confirmDelete, setConfirmDelete] = useState(null);

  useEffect(() => {
    checkAdmin();
    fetchPlaylists();
  }, []);

  const checkAdmin = () => {
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    if (user.role !== "admin") {
      navigate("/");
    }
  };

  const fetchPlaylists = async () => {
    try {
      const res = await getPlaylists();
      setPlaylists(res.data);
    } catch (err) {
      console.error("Failed to fetch playlists:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchPlaylistVideos = async (playlistId) => {
    if (playlistVideos[playlistId]) return;

    try {
      const res = await getVideosByPlaylist(playlistId);
      setPlaylistVideos((prev) => ({
        ...prev,
        [playlistId]: res.data,
      }));
    } catch (err) {
      console.error("Failed to fetch videos:", err);
    }
  };

  const togglePlaylist = (playlistId) => {
    if (expandedPlaylist === playlistId) {
      setExpandedPlaylist(null);
    } else {
      setExpandedPlaylist(playlistId);
      fetchPlaylistVideos(playlistId);
    }
  };

  const handleDeleteVideo = async () => {
    if (!confirmDelete) return;

    try {
      await deleteVideo(confirmDelete.id);
      toast.success("Video deleted successfully");

      // Refresh playlist videos
      const playlistId = confirmDelete.playlistId;
      const res = await getVideosByPlaylist(playlistId);
      setPlaylistVideos((prev) => ({
        ...prev,
        [playlistId]: res.data,
      }));

      // Refresh playlists to update counts
      fetchPlaylists();
    } catch (err) {
      toast.error("Failed to delete video");
      console.error(err);
    } finally {
      setConfirmDelete(null);
    }
  };

  const handleDeletePlaylist = async () => {
    if (!confirmDelete) return;

    try {
      await deletePlaylist(confirmDelete.id);
      toast.success("Playlist deleted successfully");
      setExpandedPlaylist(null);
      fetchPlaylists();
    } catch (err) {
      toast.error("Failed to delete playlist");
      console.error(err);
    } finally {
      setConfirmDelete(null);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen bg-white"
    >
      {/* Header */}
      <header className="sticky top-0 z-10 bg-white border-b border-gray-200">
        <div className="flex items-center gap-4 p-4">
          <button
            onClick={() => navigate("/")}
            className="p-2 hover:bg-gray-100 rounded-full"
          >
            <ArrowLeft className="w-5 h-5 text-[#002856]" />
          </button>
          <h1 className="text-xl font-bold text-[#002856]">Admin Dashboard</h1>
        </div>
      </header>

      {/* Quick Actions */}
      <div className="p-4">
        <h2 className="text-gray-500 text-sm font-medium mb-3">QUICK ACTIONS</h2>
        <div className="grid grid-cols-3 gap-3">
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate("/admin/upload")}
            className="flex flex-col items-center gap-2 p-4 bg-[#edb843]/10 border border-[#edb843]/30 rounded-2xl"
          >
            <Plus className="w-7 h-7 text-[#edb843]" />
            <span className="text-[#002856] font-medium text-sm">Upload</span>
          </motion.button>
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate("/admin/playlists")}
            className="flex flex-col items-center gap-2 p-4 bg-gray-50 border border-gray-200 rounded-2xl"
          >
            <ListMusic className="w-7 h-7 text-gray-400" />
            <span className="text-[#002856] font-medium text-sm">Playlists</span>
          </motion.button>
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate("/admin/videos")}
            className="flex flex-col items-center gap-2 p-4 bg-gray-50 border border-gray-200 rounded-2xl"
          >
            <Video className="w-7 h-7 text-gray-400" />
            <span className="text-[#002856] font-medium text-sm">Videos</span>
          </motion.button>
        </div>
      </div>

      {/* Stats */}
      <div className="p-4">
        <h2 className="text-gray-500 text-sm font-medium mb-3">OVERVIEW</h2>
        <div className="grid grid-cols-2 gap-3">
          <div className="p-4 bg-[#002856] rounded-xl">
            <p className="text-3xl font-bold text-white">{playlists.length}</p>
            <p className="text-white/70 text-sm">Playlists</p>
          </div>
          <div className="p-4 bg-[#002856] rounded-xl">
            <p className="text-3xl font-bold text-white">
              {playlists.reduce((acc, p) => acc + (p.video_count || 0), 0)}
            </p>
            <p className="text-white/70 text-sm">Videos</p>
          </div>
        </div>
      </div>

      {/* Playlists */}
      <div className="p-4 pb-20">
        <h2 className="text-gray-500 text-sm font-medium mb-3">PLAYLISTS</h2>
        <div className="space-y-2">
          {playlists.map((playlist) => (
            <div key={playlist.playlist_id} className="border border-gray-100 rounded-xl overflow-hidden">
              {/* Playlist Header */}
              <div className="flex items-center gap-3 p-3 bg-gray-50">
                <div className="w-12 h-12 bg-[#002856]/10 rounded-lg flex items-center justify-center">
                  <Video className="w-5 h-5 text-[#002856]" />
                </div>
                <div className="flex-1">
                  <p className="text-[#002856] font-medium">{playlist.name}</p>
                  <p className="text-gray-500 text-sm">
                    {playlist.video_count || 0} videos
                  </p>
                </div>
                <button
                  onClick={() =>
                    setConfirmDelete({
                      type: "playlist",
                      id: playlist.playlist_id,
                      name: playlist.name,
                    })
                  }
                  className="p-2 hover:bg-red-50 rounded-lg"
                >
                  <Trash2 className="w-4 h-4 text-red-500" />
                </button>
                <button
                  onClick={() => togglePlaylist(playlist.playlist_id)}
                  className="p-2 hover:bg-gray-100 rounded-lg"
                >
                  {expandedPlaylist === playlist.playlist_id ? (
                    <ChevronUp className="w-5 h-5 text-gray-400" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-gray-400" />
                  )}
                </button>
              </div>

              {/* Videos List */}
              {expandedPlaylist === playlist.playlist_id && (
                <div className="bg-white border-t border-gray-100">
                  {playlistVideos[playlist.playlist_id]?.map((video) => (
                    <div
                      key={video.video_id}
                      className="flex items-center gap-3 p-3 border-b border-gray-50 last:border-0"
                    >
                      <div className="w-16 h-16 bg-gray-100 rounded-lg overflow-hidden shrink-0">
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
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-[#002856] truncate">
                          {video.title}
                        </p>
                        <p className="text-xs text-gray-500">
                          {video.view_count || 0} views
                        </p>
                      </div>
                      <button
                        onClick={() =>
                          setConfirmDelete({
                            type: "video",
                            id: video.video_id,
                            name: video.title,
                            playlistId: playlist.playlist_id,
                          })
                        }
                        className="p-2 hover:bg-red-50 rounded-lg"
                      >
                        <Trash2 className="w-4 h-4 text-red-500" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Confirm Delete Dialog */}
      <ConfirmDialog
        isOpen={!!confirmDelete}
        title={`Delete ${confirmDelete?.type === "playlist" ? "Playlist" : "Video"}?`}
        message={`Are you sure you want to delete "${confirmDelete?.name}"? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        onConfirm={
          confirmDelete?.type === "playlist"
            ? handleDeletePlaylist
            : handleDeleteVideo
        }
        onCancel={() => setConfirmDelete(null)}
      />
    </motion.div>
  );
}
