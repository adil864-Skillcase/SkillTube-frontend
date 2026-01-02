import { useState, useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import { ArrowLeft, Upload, X } from "lucide-react";

import {
  getVideoById,
  updateVideo,
  uploadThumbnail,
} from "../../api/endpoints";
import { CATEGORIES } from "../../constants/categories";

export default function EditVideo() {
  const { id } = useParams();
  const navigate = useNavigate();
  const thumbInputRef = useRef(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [video, setVideo] = useState(null);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [thumbnailUrl, setThumbnailUrl] = useState("");
  const [thumbnailFile, setThumbnailFile] = useState(null);
  const [thumbPreview, setThumbPreview] = useState(null);

  useEffect(() => {
    fetchVideo();
  }, [id]);

  const fetchVideo = async () => {
    try {
      const res = await getVideoById(id);
      const v = res.data;
      setVideo(v);
      setTitle(v.title || "");
      setDescription(v.description || "");
      setCategory(v.category || "");
      setThumbnailUrl(v.thumbnail_url || "");
      setThumbPreview(v.thumbnail_url || null);
    } catch (err) {
      console.error("Failed to fetch video:", err);
      toast.error("Failed to load video");
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

    setSaving(true);
    try {
      let finalThumbnailUrl = thumbnailUrl;

      // Upload new thumbnail if selected
      if (thumbnailFile) {
        const thumbRes = await uploadThumbnail(thumbnailFile);
        finalThumbnailUrl = thumbRes.data.thumbnailUrl;
      }

      await updateVideo(id, {
        title: title.trim(),
        description: description.trim() || null,
        category: category || null,
        thumbnailUrl: finalThumbnailUrl || null,
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
      className="min-h-screen bg-white"
    >
      {/* Header */}
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

      {/* Form */}
      <form onSubmit={handleSubmit} className="p-4 space-y-6">
        {/* Title */}
        <div>
          <label className="block text-[#002856] text-sm font-medium mb-2">
            Title *
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Video title"
            className="w-full bg-gray-50 text-[#002856] px-4 py-3 rounded-xl border border-gray-200 focus:border-[#edb843] outline-none"
          />
        </div>

        {/* Description */}
        <div>
          <label className="block text-[#002856] text-sm font-medium mb-2">
            Description
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Video description"
            rows={3}
            className="w-full bg-gray-50 text-[#002856] px-4 py-3 rounded-xl border border-gray-200 focus:border-[#edb843] outline-none resize-none"
          />
        </div>

        {/* Category */}
        <div>
          <label className="block text-[#002856] text-sm font-medium mb-2">
            Category
          </label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full bg-gray-50 text-[#002856] px-4 py-3 rounded-xl border border-gray-200 focus:border-[#edb843] outline-none"
          >
            <option value="">Select a category</option>
            {CATEGORIES.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>

        {/* Thumbnail */}
        <div>
          <label className="block text-[#002856] text-sm font-medium mb-2">
            Thumbnail
          </label>
          <input
            ref={thumbInputRef}
            type="file"
            accept="image/*"
            onChange={handleThumbnailSelect}
            className="hidden"
          />

          {thumbPreview ? (
            <div className="relative w-32 aspect-[9/16] bg-gray-100 rounded-xl overflow-hidden">
              <img
                src={thumbPreview}
                className="w-full h-full object-cover"
                alt="Thumbnail preview"
              />
              <button
                type="button"
                onClick={() => {
                  setThumbnailFile(null);
                  setThumbPreview(null);
                  setThumbnailUrl("");
                }}
                className="absolute top-1 right-1 w-6 h-6 bg-white/80 rounded-full flex items-center justify-center"
              >
                <X className="w-3 h-3 text-[#002856]" />
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => thumbInputRef.current?.click()}
              className="w-32 aspect-[9/16] bg-gray-50 border-2 border-dashed border-gray-300 rounded-xl flex flex-col items-center justify-center gap-1"
            >
              <Upload className="w-5 h-5 text-gray-400" />
              <span className="text-gray-500 text-xs">Thumbnail</span>
            </button>
          )}
        </div>

        {/* Current Playlist Info */}
        {video && (
          <div className="bg-gray-50 p-4 rounded-xl">
            <p className="text-sm text-gray-500">Playlist</p>
            <p className="font-medium text-[#002856]">
              {video.playlist_name || "Unknown"}
            </p>
          </div>
        )}

        {/* Submit Button */}
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
