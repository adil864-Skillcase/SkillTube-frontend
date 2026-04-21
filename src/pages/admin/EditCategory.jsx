import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Save, Trash2, ListMusic } from "lucide-react";
import toast from "react-hot-toast";
import { useDispatch, useSelector } from "react-redux";

import { updateCategory, deleteCategory, getPlaylistsByCategory } from "../../api/endpoints";
import { getCategoryIcon, CATEGORY_ICON_OPTIONS } from "../../utils/categoryIcons";
import { fetchCategories } from "../../redux/slices/categorySlice";
import ConfirmDialog from "../../components/ConfirmDialog";
import { triggerHaptic, triggerNotificationHaptic } from "../../utils/haptics";

export default function EditCategory() {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  
  const { items } = useSelector((state) => state.categories);
  const selectedCategory = items.find((cat) => String(cat.category_id) === id || String(cat.id) === id);

  const [name, setName] = useState("");
  const [iconKey, setIconKey] = useState(CATEGORY_ICON_OPTIONS[0]);
  const [isActive, setIsActive] = useState(true);
  const [saving, setSaving] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [playlists, setPlaylists] = useState([]);
  const [loadingPlaylists, setLoadingPlaylists] = useState(true);

  useEffect(() => {
    if (!items.length) {
      dispatch(fetchCategories(true));
    }
  }, [dispatch, items.length]);

  useEffect(() => {
    if (selectedCategory) {
      setName(selectedCategory.name || "");
      setIconKey(selectedCategory.icon_key || CATEGORY_ICON_OPTIONS[0]);
      setIsActive(selectedCategory.is_active);
      fetchPlaylists();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedCategory]);

  const fetchPlaylists = async () => {
    setLoadingPlaylists(true);
    try {
      const res = await getPlaylistsByCategory(id);
      setPlaylists(res.data);
    } catch (err) {
      console.error("Failed to load attached playlists:", err);
    } finally {
      setLoadingPlaylists(false);
    }
  };

  const handleUpdate = async () => {
    if (!name.trim()) {
      toast.error("Category name is required");
      triggerNotificationHaptic("error");
      return;
    }
    setSaving(true);
    try {
      await updateCategory(id, { name, iconKey, color: "#edb843", isActive });
      toast.success("Category updated");
      triggerNotificationHaptic("success");
      navigate("/admin/categories");
    } catch (err) {
      toast.error(err.response?.data?.error || "Failed to update category");
      triggerNotificationHaptic("error");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    try {
      await deleteCategory(id);
      toast.success("Category successfully deleted");
      triggerNotificationHaptic("success");
      navigate("/admin/categories");
    } catch (err) {
      toast.error("Failed to delete category");
      triggerNotificationHaptic("error");
    } finally {
      setConfirmDelete(false);
    }
  };

  if (!selectedCategory) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[#edb843] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen bg-white pb-20"
    >
      <header className="sticky top-0 z-10 bg-white border-b border-gray-200">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center gap-4">
            <button onClick={() => navigate("/admin/categories")} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
              <ArrowLeft className="w-5 h-5 text-[#002856]" />
            </button>
            <h1 className="text-xl font-bold text-[#002856]">Edit Category</h1>
          </div>
          <button 
            onClick={() => setConfirmDelete(true)}
            className="p-2 hover:bg-red-50 text-red-500 rounded-lg transition-colors"
          >
            <Trash2 className="w-5 h-5" />
          </button>
        </div>
      </header>

      <div className="p-4 space-y-6 max-w-4xl mx-auto pt-6">
        <div>
          <label className="block text-[#002856] text-sm font-medium mb-2">Category Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Technology"
            className="w-full px-4 py-3 border border-gray-200 rounded-xl outline-none focus:border-[#edb843] bg-gray-50 text-[#002856]"
          />
        </div>
        
        <div>
          <label className="block text-[#002856] text-sm font-medium mb-3">Select Icon</label>
          <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-3 bg-gray-50 p-4 rounded-xl border border-gray-100">
            {CATEGORY_ICON_OPTIONS.map((key) => {
              const Icon = getCategoryIcon(key);
              const isSelected = iconKey === key;
              return (
                <button
                  key={key}
                  onClick={() => setIconKey(key)}
                  className={`aspect-square rounded-xl flex flex-col items-center justify-center gap-1 transition-all ${
                    isSelected 
                      ? "bg-[#edb843] text-[#002856] shadow-sm transform scale-105 border border-[#edb843]" 
                      : "bg-white text-gray-500 hover:bg-gray-100 border border-gray-200 hover:text-[#002856]"
                  }`}
                  title={key}
                >
                  <Icon className="w-6 h-6" />
                </button>
              );
            })}
          </div>
        </div>

        <div className="flex items-center gap-3 bg-gray-50 p-4 rounded-xl border border-gray-100">
             <div className="flex-1">
               <p className="font-semibold text-[#002856]">Visibility Status</p>
               <p className="text-sm text-gray-500">Toggle whether this category appears in the main app feed</p>
             </div>
             <button
                onClick={() => {
                  triggerHaptic("light");
                  setIsActive(!isActive);
                }}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  isActive ? "bg-[#002856]" : "bg-gray-300"
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    isActive ? "translate-x-6" : "translate-x-1"
                  }`}
                />
            </button>
        </div>

        <motion.button
          whileTap={{ scale: 0.98 }}
          disabled={saving}
          onClick={handleUpdate}
          className="w-full mt-6 flex items-center justify-center gap-2 px-4 py-4 bg-[#002856] hover:bg-[#003d83] text-white rounded-xl font-bold transition-colors disabled:opacity-50"
        >
          {saving ? "Saving..." : (
            <>
              <Save className="w-5 h-5 text-[#edb843]" />
              Save Changes
            </>
          )}
        </motion.button>

        {/* ATTACHED PLAYLISTS SECTION */}
        <div className="pt-6 mt-6 border-t border-gray-100">
           <h2 className="text-[#002856] font-bold text-lg mb-4">Attached Playlists</h2>
           {loadingPlaylists ? (
              <div className="text-sm text-gray-500 py-4">Checking associations...</div>
           ) : playlists.length > 0 ? (
               <div className="space-y-3">
                 {playlists.map((pl) => (
                    <div key={pl.playlist_id} className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl border border-gray-100">
                         <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shrink-0 shadow-sm border border-gray-100">
                            <ListMusic className="w-5 h-5 text-[#002856]" />
                         </div>
                         <div className="flex-1">
                             <p className="font-semibold text-[#002856]">{pl.name}</p>
                             <p className="text-xs text-gray-500">{pl.video_count || 0} videos</p>
                         </div>
                    </div>
                 ))}
               </div>
           ) : (
               <div className="bg-gray-50 p-6 rounded-xl border border-gray-100 border-dashed text-center">
                   <p className="text-gray-500 font-medium">No playlists are attached to this category.</p>
               </div>
           )}
        </div>
      </div>

      <ConfirmDialog
        isOpen={confirmDelete}
        title="Delete Category?"
        message={`Are you sure you want to completely delete "${name}"? WARNING: This action is permanent and WILL completely cascade delete ALL attached Playlists and Videos within them.`}
        confirmText="Yes, Data Delete"
        cancelText="Cancel"
        onConfirm={handleDelete}
        onCancel={() => setConfirmDelete(false)}
      />
    </motion.div>
  );
}
