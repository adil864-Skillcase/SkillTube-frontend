import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Pencil, Trash2, Video, Search } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import toast from "react-hot-toast";
import { getAllVideos, deleteVideo } from "../../api/endpoints";
import ConfirmDialog from "../../components/ConfirmDialog";
import { fetchCategories } from "../../redux/slices/categorySlice";
import { normalizeCategories, findCategoryByAny } from "../../utils/categoryHelpers";
import { PERMISSIONS, hasPermission } from "../../utils/permissions";
import { triggerNotificationHaptic, triggerHaptic } from "../../utils/haptics";

export default function ManageVideos() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { items: categoryItems } = useSelector((state) => state.categories);
  const categories = normalizeCategories(categoryItems);

  const [videos, setVideos] = useState([]);
  const [filteredVideos, setFilteredVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [confirmDelete, setConfirmDelete] = useState(null);

  useEffect(() => {
    dispatch(fetchCategories());
    if (!hasPermission(user, PERMISSIONS.VIDEO_EDIT) && !hasPermission(user, PERMISSIONS.VIDEO_DELETE)) {
      navigate("/admin");
      return;
    }
    fetchVideos();
  }, [dispatch, navigate, user]);

  useEffect(() => {
    if (!searchQuery) {
      setFilteredVideos(videos);
      return;
    }
    const q = searchQuery.toLowerCase();
    setFilteredVideos(
      videos.filter(
        (v) =>
          v.title.toLowerCase().includes(q) ||
          v.playlist_name?.toLowerCase().includes(q)
      )
    );
  }, [searchQuery, videos]);

  const fetchVideos = async () => {
    try {
      const res = await getAllVideos();
      setVideos(res.data);
      setFilteredVideos(res.data);
    } catch (err) {
      console.error("Failed to fetch videos:", err);
      toast.error("Failed to load videos");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirmDelete) return;
    try {
      await deleteVideo(confirmDelete.id);
      toast.success("Video deleted");
      triggerNotificationHaptic("success");
      fetchVideos();
    } catch (err) {
      toast.error("Failed to delete video");
      triggerNotificationHaptic("error");
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
      <header className="sticky top-0 z-10 bg-white border-b border-gray-200">
        <div className="flex items-center gap-4 p-4">
          <button
            onClick={() => {
              triggerHaptic("light");
              navigate("/admin");
            }}
            className="p-2 hover:bg-gray-100 rounded-full"
          >
            <ArrowLeft className="w-5 h-5 text-[#002856]" />
          </button>
          <h1 className="text-xl font-bold text-[#002856]">Manage Videos</h1>
        </div>
      </header>

      <div className="p-4">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search videos..."
            className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-[#edb843]"
          />
        </div>
      </div>

      {loading && (
        <div className="flex justify-center py-12">
          <div className="w-8 h-8 border-2 border-[#edb843] border-t-transparent rounded-full animate-spin" />
        </div>
      )}

      {!loading && (
        <div className="px-4 pb-4 space-y-2">
          {filteredVideos.length === 0 ? (
            <div className="text-center py-12">
              <Video className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">
                {searchQuery ? "No videos found" : "No videos yet"}
              </p>
            </div>
          ) : (
            filteredVideos.map((video) => {
              const cat = findCategoryByAny(categories, video.category || video.category_id);
              return (
                <div
                  key={video.video_id}
                  className="flex items-center gap-3 p-3 border border-gray-100 rounded-xl"
                >
                  <div className="w-16 h-16 bg-gray-100 rounded-lg overflow-hidden shrink-0">
                    {video.thumbnail_url ? (
                      <img src={video.thumbnail_url} alt={video.title} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full bg-linear-to-br from-[#002856] to-[#003d83] flex items-center justify-center">
                        <Video className="w-6 h-6 text-white/30" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-[#002856] truncate">{video.title}</p>
                    <p className="text-sm text-gray-500 truncate">{video.playlist_name}</p>
                    {cat && (
                      <span
                        className="inline-block mt-1 px-2 py-0.5 text-xs rounded-full"
                        style={{ backgroundColor: `${cat.color}15`, color: cat.color }}
                      >
                        {cat.name}
                      </span>
                    )}
                  </div>
                  {hasPermission(user, PERMISSIONS.VIDEO_EDIT) && (
                    <button
                      onClick={() => {
                        triggerHaptic("light");
                        navigate(`/admin/videos/edit/${video.video_id}`);
                      }}
                      className="p-2 hover:bg-gray-100 rounded-lg"
                    >
                      <Pencil className="w-4 h-4 text-gray-400" />
                    </button>
                  )}
                  {hasPermission(user, PERMISSIONS.VIDEO_DELETE) && (
                    <button
                      onClick={() => setConfirmDelete({ id: video.video_id, title: video.title })}
                      className="p-2 hover:bg-red-50 rounded-lg"
                    >
                      <Trash2 className="w-4 h-4 text-red-500" />
                    </button>
                  )}
                </div>
              );
            })
          )}
        </div>
      )}

      <ConfirmDialog
        isOpen={!!confirmDelete}
        title="Delete Video?"
        message={`Are you sure you want to delete "${confirmDelete?.title}"?`}
        confirmText="Delete"
        cancelText="Cancel"
        onConfirm={handleDelete}
        onCancel={() => setConfirmDelete(null)}
      />
    </motion.div>
  );
}
