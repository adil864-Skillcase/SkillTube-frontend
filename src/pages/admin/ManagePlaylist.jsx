import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Plus, Pencil, Trash2, ListMusic, ChevronDown, ChevronUp, Video } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import toast from "react-hot-toast";
import {
  getPlaylistsAdmin,
  createPlaylist,
  deletePlaylist,
  getVideosByPlaylist,
  deleteVideo
} from "../../api/endpoints";
import ConfirmDialog from "../../components/ConfirmDialog";
import { fetchCategories } from "../../redux/slices/categorySlice";
import { normalizeCategories } from "../../utils/categoryHelpers";
import { PERMISSIONS, hasPermission } from "../../utils/permissions";
import SelectDropdown from "../../components/SelectDropdown";

export default function ManagePlaylist() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { items: categoryItems } = useSelector((state) => state.categories);
  const categories = normalizeCategories(categoryItems);

  const [playlists, setPlaylists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [newName, setNewName] = useState("");
  const [newCategoryId, setNewCategoryId] = useState("");
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [saving, setSaving] = useState(false);

  // Accordion State
  const [expandedPlaylist, setExpandedPlaylist] = useState(null);
  const [playlistVideos, setPlaylistVideos] = useState({});

  useEffect(() => {
    dispatch(fetchCategories());
    if (!hasPermission(user, PERMISSIONS.PLAYLIST_MANAGE)) {
      navigate("/admin");
      return;
    }
    fetchPlaylists();
  }, [dispatch, navigate, user]);

  const fetchPlaylists = async () => {
    try {
      const res = await getPlaylistsAdmin();
      setPlaylists(res.data);
    } catch (err) {
      console.error("Failed to fetch playlists:", err);
      toast.error("Failed to load playlists");
    } finally {
      setLoading(false);
    }
  };

  const fetchPlaylistVideos = async (playlistId) => {
    if (playlistVideos[playlistId]) return;
    try {
      const res = await getVideosByPlaylist(playlistId);
      setPlaylistVideos((prev) => ({ ...prev, [playlistId]: res.data }));
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

  const handleCreate = async () => {
    if (!newName.trim()) {
      toast.error("Please enter a playlist name");
      return;
    }
    setSaving(true);
    try {
      const selectedCategory = categories.find(
        (cat) => String(cat.id) === String(newCategoryId)
      );
      await createPlaylist({
        name: newName.trim(),
        category: selectedCategory?.slug || null,
        categoryId: selectedCategory?.id || null,
      });
      toast.success("Playlist created");
      setNewName("");
      setNewCategoryId("");
      setShowCreate(false);
      fetchPlaylists();
    } catch (err) {
      toast.error(err.response?.data?.error || "Failed to create playlist");
    } finally {
      setSaving(false);
    }
  };

  const handleDeletePlaylist = async () => {
    if (!confirmDelete) return;
    try {
      await deletePlaylist(confirmDelete.id);
      toast.success("Playlist deleted");
      setExpandedPlaylist(null);
      fetchPlaylists();
    } catch (err) {
      toast.error("Failed to delete playlist");
    } finally {
      setConfirmDelete(null);
    }
  };

  const handleDeleteVideo = async () => {
    if (!confirmDelete) return;
    try {
      await deleteVideo(confirmDelete.id);
      toast.success("Video deleted successfully");
      const playlistId = confirmDelete.playlistId;
      const res = await getVideosByPlaylist(playlistId);
      setPlaylistVideos((prev) => ({ ...prev, [playlistId]: res.data }));
      fetchPlaylists();
    } catch (err) {
      toast.error("Failed to delete video");
    } finally {
      setConfirmDelete(null);
    }
  };

  const canDeleteVideo = hasPermission(user, PERMISSIONS.VIDEO_DELETE);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen bg-white"
    >
      <header className="sticky top-0 z-10 bg-white border-b border-gray-200">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate("/admin")}
              className="p-2 hover:bg-gray-100 rounded-full"
            >
              <ArrowLeft className="w-5 h-5 text-[#002856]" />
            </button>
            <h1 className="text-xl font-bold text-[#002856]">Manage Playlists</h1>
          </div>
          <button
            onClick={() => setShowCreate(true)}
            className="flex items-center gap-2 px-4 py-2 bg-[#edb843] text-[#002856] font-medium rounded-xl"
          >
            <Plus className="w-4 h-4" />
            New
          </button>
        </div>
      </header>

      <AnimatePresence>
        {showCreate && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden border-b border-gray-100"
          >
            <div className="p-4 bg-gray-50 space-y-3">
              <input
                type="text"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="Enter playlist name..."
                className="w-full px-4 py-3 border border-gray-200 rounded-xl outline-none focus:border-[#edb843]"
                autoFocus
              />
              <SelectDropdown
                value={newCategoryId}
                onChange={setNewCategoryId}
                placeholder="Select a category"
                options={categories.map((cat) => ({ value: String(cat.id), label: cat.name }))}
              />
              <div className="flex gap-2">
                <button
                  onClick={handleCreate}
                  disabled={saving}
                  className="flex-1 px-4 py-3 bg-[#002856] text-white rounded-xl disabled:opacity-50"
                >
                  {saving ? "..." : "Create"}
                </button>
                <button
                  onClick={() => {
                    setShowCreate(false);
                    setNewName("");
                    setNewCategoryId("");
                  }}
                  className="px-4 py-3 bg-gray-200 text-gray-600 rounded-xl"
                >
                  Cancel
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {loading && (
        <div className="flex justify-center py-12">
          <div className="w-8 h-8 border-2 border-[#edb843] border-t-transparent rounded-full animate-spin" />
        </div>
      )}

      {!loading && (
        <div className="p-4 space-y-3 pb-20">
          {playlists.length === 0 ? (
            <div className="text-center py-12">
              <ListMusic className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">No playlists yet</p>
            </div>
          ) : (
            playlists.map((playlist) => (
              <div key={playlist.playlist_id} className="border border-gray-100 rounded-xl overflow-hidden">
                <div 
                  className="flex items-center gap-3 p-3 bg-gray-50 cursor-pointer hover:bg-gray-100/50"
                  onClick={() => togglePlaylist(playlist.playlist_id)}
                >
                  <div className="w-12 h-12 bg-[#002856]/10 rounded-lg flex items-center justify-center shrink-0">
                    <ListMusic className="w-5 h-5 text-[#002856]" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-[#002856] truncate flex items-center gap-2">
                      {playlist.name}
                      {!playlist.is_active && (
                        <span className="px-2 py-0.5 rounded-md bg-gray-200 text-gray-500 text-[10px] font-bold uppercase">Hidden</span>
                      )}
                    </p>
                    <p className="text-sm text-gray-500 font-medium">{playlist.video_count || 0} videos</p>
                  </div>
                  
                  <div className="flex items-center gap-1 shrink-0" onClick={e => e.stopPropagation()}>
                    <button
                      onClick={() => navigate(`/admin/playlists/edit/${playlist.playlist_id}`)}
                      className="p-2 hover:bg-white rounded-lg transition-colors"
                    >
                      <Pencil className="w-4 h-4 text-gray-500" />
                    </button>
                    <button
                      onClick={() =>
                        setConfirmDelete({ type: "playlist", id: playlist.playlist_id, name: playlist.name })
                      }
                      className="p-2 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-4 h-4 text-red-500" />
                    </button>
                    <div className="w-px h-6 bg-gray-200 mx-1"></div>
                    <button 
                      onClick={() => togglePlaylist(playlist.playlist_id)}
                      className="p-2 text-gray-400"
                    >
                      {expandedPlaylist === playlist.playlist_id ? (
                        <ChevronUp className="w-5 h-5" />
                      ) : (
                        <ChevronDown className="w-5 h-5" />
                      )}
                    </button>
                  </div>
                </div>

                {/* NESTED VIDEOS EXPANSION */}
                <AnimatePresence>
                  {expandedPlaylist === playlist.playlist_id && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="bg-white border-t border-gray-100"
                    >
                      {playlistVideos[playlist.playlist_id]?.length === 0 ? (
                        <p className="p-6 text-center text-sm text-gray-500 italic">No videos in this playlist.</p>
                      ) : (
                        playlistVideos[playlist.playlist_id]?.map((video) => (
                          <div
                            key={video.video_id}
                            className="flex items-center gap-3 p-3 pl-6 border-b border-gray-50 last:border-0"
                          >
                            <div className="w-12 h-16 bg-gray-100 rounded-lg overflow-hidden shrink-0">
                              {video.thumbnail_url ? (
                                <img src={video.thumbnail_url} alt={video.title} className="w-full h-full object-cover" />
                              ) : (
                                <div className="w-full h-full bg-gradient-to-br from-[#002856] to-[#003d83] flex items-center justify-center">
                                  <Video className="w-4 h-4 text-white/50" />
                                </div>
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-semibold text-[#002856] truncate">{video.title}</p>
                              <p className="text-xs text-gray-500">{video.view_count || 0} views</p>
                            </div>
                            
                            {canDeleteVideo && (
                              <button
                                onClick={() =>
                                  setConfirmDelete({
                                    type: "video",
                                    id: video.video_id,
                                    name: video.title,
                                    playlistId: playlist.playlist_id,
                                  })
                                }
                                className="p-2 hover:bg-red-50 rounded-lg mr-2 shrink-0"
                              >
                                <Trash2 className="w-4 h-4 text-red-500" />
                              </button>
                            )}
                          </div>
                        ))
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))
          )}
        </div>
      )}

      <ConfirmDialog
        isOpen={!!confirmDelete}
        title={`Delete ${confirmDelete?.type === "playlist" ? "Playlist" : "Video"}?`}
        message={
          confirmDelete?.type === "playlist"
            ? `Are you sure you want to delete "${confirmDelete?.name}"? All videos in this playlist will also be deleted.`
            : `Are you sure you want to delete video "${confirmDelete?.name}" from this playlist?`
        }
        confirmText="Delete"
        cancelText="Cancel"
        onConfirm={confirmDelete?.type === "playlist" ? handleDeletePlaylist : handleDeleteVideo}
        onCancel={() => setConfirmDelete(null)}
      />
    </motion.div>
  );
}
