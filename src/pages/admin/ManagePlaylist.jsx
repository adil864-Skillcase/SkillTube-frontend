import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  Plus,
  Pencil,
  Trash2,
  Check,
  X,
  ListMusic,
} from "lucide-react";
import toast from "react-hot-toast";

import {
  getPlaylists,
  createPlaylist,
  updatePlaylist,
  deletePlaylist,
} from "../../api/endpoints";
import { CATEGORIES } from "../../constants/categories";
import ConfirmDialog from "../../components/ConfirmDialog";

export default function ManagePlaylist() {
  const navigate = useNavigate();
  const [playlists, setPlaylists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const [editName, setEditName] = useState("");
  const [showCreate, setShowCreate] = useState(false);
  const [newName, setNewName] = useState("");
  const [newCategory, setNewCategory] = useState("");
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [saving, setSaving] = useState(false);

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
      toast.error("Failed to load playlists");
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async () => {
    if (!newName.trim()) {
      toast.error("Please enter a playlist name");
      return;
    }

    setSaving(true);
    try {
      await createPlaylist({ 
        name: newName.trim(),
        category: newCategory || null,
      });
      toast.success("Playlist created");
      setNewName("");
      setNewCategory("");
      setShowCreate(false);
      fetchPlaylists();
    } catch (err) {
      toast.error(err.response?.data?.error || "Failed to create playlist");
    } finally {
      setSaving(false);
    }
  };

  const startEdit = (playlist) => {
    setEditingId(playlist.playlist_id);
    setEditName(playlist.name);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditName("");
  };

  const handleUpdate = async (playlistId) => {
    if (!editName.trim()) {
      toast.error("Name cannot be empty");
      return;
    }

    setSaving(true);
    try {
      await updatePlaylist(playlistId, { name: editName.trim() });
      toast.success("Playlist updated");
      setEditingId(null);
      fetchPlaylists();
    } catch (err) {
      toast.error("Failed to update playlist");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirmDelete) return;

    try {
      await deletePlaylist(confirmDelete.id);
      toast.success("Playlist deleted");
      fetchPlaylists();
    } catch (err) {
      toast.error("Failed to delete playlist");
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
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate("/admin")}
              className="p-2 hover:bg-gray-100 rounded-full"
            >
              <ArrowLeft className="w-5 h-5 text-[#002856]" />
            </button>
            <h1 className="text-xl font-bold text-[#002856]">
              Manage Playlists
            </h1>
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

      {/* Create Form */}
      <AnimatePresence>
        {showCreate && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden border-b border-gray-100"
          >
            <div className="p-4 bg-gray-50 space-y-3">
              <div>
                <label className="text-sm text-gray-500 font-medium mb-2 block">
                  Playlist Name
                </label>
                <input
                  type="text"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="Enter playlist name..."
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl outline-none focus:border-[#edb843]"
                  autoFocus
                />
              </div>
              <div>
                <label className="text-sm text-gray-500 font-medium mb-2 block">
                  Category
                </label>
                <select
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl outline-none focus:border-[#edb843] bg-white"
                >
                  <option value="">Select a category</option>
                  {CATEGORIES.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>
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
                    setNewCategory("");
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

      {/* Loading State */}
      {loading && (
        <div className="flex justify-center py-12">
          <div className="w-8 h-8 border-2 border-[#edb843] border-t-transparent rounded-full animate-spin" />
        </div>
      )}

      {/* Playlists List */}
      {!loading && (
        <div className="p-4 space-y-2">
          {playlists.length === 0 ? (
            <div className="text-center py-12">
              <ListMusic className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">No playlists yet</p>
              <button
                onClick={() => setShowCreate(true)}
                className="mt-4 text-[#edb843] font-medium"
              >
                Create your first playlist
              </button>
            </div>
          ) : (
            playlists.map((playlist) => (
              <div
                key={playlist.playlist_id}
                className="flex items-center gap-3 p-4 border border-gray-100 rounded-xl"
              >
                <div className="w-12 h-12 bg-[#002856]/10 rounded-lg flex items-center justify-center shrink-0">
                  <ListMusic className="w-5 h-5 text-[#002856]" />
                </div>

                {editingId === playlist.playlist_id ? (
                  // Edit Mode
                  <div className="flex-1 flex items-center gap-2">
                    <input
                      type="text"
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      className="flex-1 px-3 py-2 border border-gray-200 rounded-lg outline-none focus:border-[#edb843]"
                      autoFocus
                    />
                    <button
                      onClick={() => handleUpdate(playlist.playlist_id)}
                      disabled={saving}
                      className="p-2 bg-green-50 hover:bg-green-100 rounded-lg"
                    >
                      <Check className="w-4 h-4 text-green-600" />
                    </button>
                    <button
                      onClick={cancelEdit}
                      className="p-2 bg-gray-50 hover:bg-gray-100 rounded-lg"
                    >
                      <X className="w-4 h-4 text-gray-500" />
                    </button>
                  </div>
                ) : (
                  // View Mode
                  <>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-[#002856] truncate">
                        {playlist.name}
                      </p>
                      <p className="text-sm text-gray-500">
                        {playlist.video_count || 0} videos
                      </p>
                    </div>
                    <button
                      onClick={() => navigate(`/admin/playlists/edit/${playlist.playlist_id}`)}
                      className="p-2 hover:bg-gray-100 rounded-lg"
                    >
                      <Pencil className="w-4 h-4 text-gray-400" />
                    </button>
                    <button
                      onClick={() =>
                        setConfirmDelete({
                          id: playlist.playlist_id,
                          name: playlist.name,
                        })
                      }
                      className="p-2 hover:bg-red-50 rounded-lg"
                    >
                      <Trash2 className="w-4 h-4 text-red-500" />
                    </button>
                  </>
                )}
              </div>
            ))
          )}
        </div>
      )}

      {/* Confirm Delete Dialog */}
      <ConfirmDialog
        isOpen={!!confirmDelete}
        title="Delete Playlist?"
        message={`Are you sure you want to delete "${confirmDelete?.name}"? All videos in this playlist will also be deleted.`}
        confirmText="Delete"
        cancelText="Cancel"
        onConfirm={handleDelete}
        onCancel={() => setConfirmDelete(null)}
      />
    </motion.div>
  );
}
