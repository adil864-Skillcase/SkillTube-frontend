import { useState, useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import { useDispatch, useSelector } from "react-redux";
import toast from "react-hot-toast";
import { ArrowLeft, Upload, X } from "lucide-react";
import {
  updatePlaylist,
  initThumbnailUpload,
  getPlaylistsAdmin,
} from "../../api/endpoints";
import { uploadFileToSignedUrl } from "../../api/uploadClient";
import { fetchCategories } from "../../redux/slices/categorySlice";
import { normalizeCategories, findCategoryByAny } from "../../utils/categoryHelpers";
import SelectDropdown from "../../components/SelectDropdown";

export default function EditPlaylist() {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { items: categoryItems } = useSelector((state) => state.categories);
  const categories = normalizeCategories(categoryItems);
  const thumbInputRef = useRef(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [playlist, setPlaylist] = useState(null);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [thumbnailUrl, setThumbnailUrl] = useState("");
  const [thumbnailFile, setThumbnailFile] = useState(null);
  const [thumbPreview, setThumbPreview] = useState(null);
  // store raw playlist data so we can re-sync categoryId when categories load
  const rawPlaylistRef = useRef(null);

  useEffect(() => {
    dispatch(fetchCategories());
    fetchPlaylist();
  }, [dispatch, id]);

  // Re-sync categoryId whenever categories finish loading
  useEffect(() => {
    if (categories.length === 0 || !rawPlaylistRef.current) return;
    const raw = rawPlaylistRef.current;
    const matched = findCategoryByAny(categories, raw.category_id ?? raw.category);
    if (matched) setCategoryId(String(matched.id));
  }, [categories.length]); // eslint-disable-line react-hooks/exhaustive-deps

  const fetchPlaylist = async () => {
    try {
      const res = await getPlaylistsAdmin();
      const found = res.data.find((p) => p.playlist_id === parseInt(id, 10));
      if (!found) {
        toast.error("Playlist not found");
        navigate("/admin/playlists");
        return;
      }
      rawPlaylistRef.current = found;
      setPlaylist(found);
      setName(found.name || "");
      setDescription(found.description || "");
      setIsActive(found.is_active !== false); // default true
      setThumbnailUrl(found.thumbnail_url || "");
      setThumbPreview(found.thumbnail_url || null);
      // Try to sync immediately if categories already loaded
      if (categories.length > 0) {
        const matched = findCategoryByAny(categories, found.category_id ?? found.category);
        if (matched) setCategoryId(String(matched.id));
      }
    } catch (err) {
      console.error("Failed to fetch playlist:", err);
      toast.error("Failed to load playlist");
    } finally {
      setLoading(false);
    }
  };

  const handleThumbnailSelect = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setThumbnailFile(file);
      setThumbPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error("Playlist name is required");
      return;
    }

    setSaving(true);
    try {
      let finalThumbnailUrl = thumbnailUrl;
      let thumbnailKey = null;
      if (thumbnailFile) {
        const thumbInit = await initThumbnailUpload(thumbnailFile);
        await uploadFileToSignedUrl(thumbInit.data.uploadUrl, thumbnailFile);
        finalThumbnailUrl = thumbInit.data.thumbnailUrl;
        thumbnailKey = thumbInit.data.objectKey;
      }

      const selectedCategory = categories.find((cat) => String(cat.id) === String(categoryId));

      await updatePlaylist(id, {
        name: name.trim(),
        description: description.trim() || null,
        category: selectedCategory?.slug || null,
        categoryId: selectedCategory?.id || null,
        thumbnailUrl: finalThumbnailUrl || null,
        thumbnailKey,
        isActive,
      });

      toast.success("Playlist updated");
      navigate("/admin/playlists");
    } catch (err) {
      console.error("Update error:", err);
      toast.error(err.response?.data?.error || "Failed to update playlist");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
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
      className="min-h-screen bg-white"
    >
      <header className="sticky top-0 z-10 bg-white border-b border-gray-200">
        <div className="flex items-center gap-4 p-4">
          <button
            onClick={() => navigate("/admin/playlists")}
            className="p-2 hover:bg-gray-100 rounded-full"
          >
            <ArrowLeft className="w-5 h-5 text-[#002856]" />
          </button>
          <h1 className="text-xl font-bold text-[#002856]">Edit Playlist</h1>
        </div>
      </header>

      <form onSubmit={handleSubmit} className="p-4 space-y-6">
        <div>
          <label className="block text-[#002856] text-sm font-medium mb-2">Name *</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Playlist name"
            className="w-full bg-gray-50 text-[#002856] px-4 py-3 rounded-xl border border-gray-200 focus:border-[#edb843] outline-none"
          />
        </div>

        <div>
          <label className="block text-[#002856] text-sm font-medium mb-2">Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Playlist description"
            rows={3}
            className="w-full bg-gray-50 text-[#002856] px-4 py-3 rounded-xl border border-gray-200 focus:border-[#edb843] outline-none resize-none"
          />
        </div>

        <div>
          <label className="block text-[#002856] text-sm font-medium mb-2">Category</label>
          <SelectDropdown
            value={categoryId}
            onChange={setCategoryId}
            placeholder="Select a category"
            options={categories.map((cat) => ({ value: String(cat.id), label: cat.name }))}
          />
        </div>

        <div className="flex items-center gap-3 bg-gray-50 p-4 rounded-xl border border-gray-100">
          <div className="flex-1">
            <p className="font-semibold text-[#002856]">Visible on App</p>
            <p className="text-sm text-gray-500">Toggle to show or hide this playlist from the main feed</p>
          </div>
          <button
            type="button"
            onClick={() => setIsActive(!isActive)}
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

        <div>
          <label className="block text-[#002856] text-sm font-medium mb-2">Thumbnail</label>
          <input
            ref={thumbInputRef}
            type="file"
            accept="image/*"
            onChange={handleThumbnailSelect}
            className="hidden"
          />
          {thumbPreview ? (
            <div className="relative w-32 aspect-[9/16] bg-gray-100 rounded-xl overflow-hidden shadow-sm">
              <img src={thumbPreview} className="w-full h-full object-cover" alt="Thumbnail preview" />
              <button
                type="button"
                onClick={() => {
                  setThumbnailFile(null);
                  setThumbPreview(null);
                  setThumbnailUrl("");
                }}
                className="absolute top-2 right-2 w-8 h-8 bg-white/80 rounded-full flex items-center justify-center"
              >
                <X className="w-4 h-4 text-[#002856]" />
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => thumbInputRef.current?.click()}
              className="w-32 aspect-[9/16] bg-gray-50 border-2 border-dashed border-gray-300 rounded-xl flex flex-col items-center justify-center gap-2 hover:bg-gray-100 transition-colors"
            >
              <Upload className="w-8 h-8 text-gray-400" />
              <span className="text-gray-500">Select thumbnail</span>
            </button>
          )}
        </div>

        <motion.button
          type="submit"
          disabled={saving}
          whileTap={{ scale: 0.98 }}
          className="w-full bg-[#edb843] text-[#002856] font-bold py-4 rounded-xl disabled:opacity-50"
        >
          {saving ? "Saving..." : "Save Changes"}
        </motion.button>
      </form>
    </motion.div>
  );
}
