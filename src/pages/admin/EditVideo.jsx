import { useState, useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import { useDispatch, useSelector } from "react-redux";
import toast from "react-hot-toast";
import { ArrowLeft, Upload, X } from "lucide-react";
import {
  getVideoById,
  updateVideo,
  initThumbnailUpload,
  getPlaylistsAdmin,
} from "../../api/endpoints";
import { uploadFileToSignedUrl } from "../../api/uploadClient";
import { fetchCategories } from "../../redux/slices/categorySlice";
import { normalizeCategories, findCategoryByAny } from "../../utils/categoryHelpers";
import SelectDropdown from "../../components/SelectDropdown";

export default function EditVideo() {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { items: categoryItems } = useSelector((state) => state.categories);
  const categories = normalizeCategories(categoryItems);
  const thumbInputRef = useRef(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [video, setVideo] = useState(null);
  const rawVideoRef = useRef(null);
  
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [playlistId, setPlaylistId] = useState("");
  const [playlists, setPlaylists] = useState([]);
  
  const [thumbnailUrl, setThumbnailUrl] = useState("");
  const [thumbnailFile, setThumbnailFile] = useState(null);
  const [thumbPreview, setThumbPreview] = useState(null);

  useEffect(() => {
    dispatch(fetchCategories());
    fetchData();
  }, [dispatch, id]);

  // Re-sync categoryId whenever categories finish loading
  useEffect(() => {
    if (categories.length === 0 || !rawVideoRef.current) return;
    const raw = rawVideoRef.current;
    const matched = findCategoryByAny(categories, raw.category_id ?? raw.category);
    if (matched) setCategoryId(String(matched.id));
  }, [categories.length]); // eslint-disable-line react-hooks/exhaustive-deps

  const fetchData = async () => {
    try {
      const [videoRes, playlistsRes] = await Promise.all([
        getVideoById(id),
        getPlaylistsAdmin()
      ]);
      setPlaylists(playlistsRes.data || []);
      const v = videoRes.data;
      rawVideoRef.current = v;
      setVideo(v);
      setTitle(v.title || "");
      setDescription(v.description || "");
      setThumbnailUrl(v.thumbnail_url || "");
      setThumbPreview(v.thumbnail_url || null);
      setPlaylistId(String(v.playlist_id || ""));
      // Try to sync immediately if categories already loaded
      if (categories.length > 0) {
        const matched = findCategoryByAny(categories, v.category_id ?? v.category);
        if (matched) setCategoryId(String(matched.id));
      }
    } catch (err) {
      console.error("Failed to fetch data:", err);
      toast.error("Failed to load video details");
      navigate("/admin/videos");
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
    if (!title.trim()) {
      toast.error("Video title is required");
      return;
    }
    if (!playlistId) {
       toast.error("Please select a playlist");
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

      const selectedCategory = categories.find((cat) => cat.id === Number(categoryId));

      await updateVideo(id, {
        title: title.trim(),
        description: description.trim() || null,
        category: selectedCategory?.slug || null,
        categoryId: selectedCategory?.id || null,
        playlistId: playlistId,
        thumbnailUrl: finalThumbnailUrl || null,
        thumbnailKey,
      });

      toast.success("Video updated");
      navigate("/admin/videos");
    } catch (err) {
      console.error("Update error:", err);
      toast.error(err.response?.data?.error || "Failed to update video");
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
      className="min-h-screen bg-white pb-10"
    >
      <header className="sticky top-0 z-10 bg-white border-b border-gray-200">
        <div className="flex items-center gap-4 p-4">
          <button
            onClick={() => navigate("/admin/videos")}
            className="p-2 hover:bg-gray-100 rounded-full"
          >
            <ArrowLeft className="w-5 h-5 text-[#002856]" />
          </button>
          <h1 className="text-xl font-bold text-[#002856]">Edit Video</h1>
        </div>
      </header>

      <form onSubmit={handleSubmit} className="p-4 space-y-6">
        <div>
          <label className="block text-[#002856] text-sm font-medium mb-2">Title *</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Video title"
            className="w-full bg-gray-50 text-[#002856] px-4 py-3 rounded-xl border border-gray-200 focus:border-[#edb843] outline-none"
          />
        </div>

        <div>
          <label className="block text-[#002856] text-sm font-medium mb-2">Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Video description"
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
        
        <div>
          <label className="block text-[#002856] text-sm font-medium mb-2">Playlist *</label>
          <SelectDropdown
            value={String(playlistId)}
            onChange={setPlaylistId}
            placeholder="Select playlist"
            options={playlists.map((pl) => ({ value: String(pl.playlist_id), label: pl.name }))}
          />
        </div>

        <div>
          <label className="block text-[#002856] text-sm font-medium mb-2">Thumbnail Preview</label>
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
                className="absolute top-2 right-2 w-7 h-7 bg-white shadow rounded-full flex items-center justify-center hover:bg-gray-100"
              >
                <X className="w-4 h-4 text-[#002856]" />
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => thumbInputRef.current?.click()}
              className="w-32 aspect-[9/16] bg-gray-50 border-2 border-dashed border-gray-300 rounded-xl flex flex-col items-center justify-center gap-1 hover:bg-gray-100 transition-colors"
            >
              <Upload className="w-5 h-5 text-gray-400" />
              <span className="text-gray-500 text-xs font-medium">Upload</span>
            </button>
          )}
        </div>

        <motion.button
          type="submit"
          disabled={saving}
          whileTap={{ scale: 0.98 }}
          className="w-full bg-[#edb843] text-[#002856] font-bold py-4 rounded-xl disabled:opacity-50 mt-4"
        >
          {saving ? "Saving..." : "Save Changes"}
        </motion.button>
      </form>
    </motion.div>
  );
}
