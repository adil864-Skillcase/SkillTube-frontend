import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useDispatch, useSelector } from "react-redux";
import toast from "react-hot-toast";
import { ArrowLeft, Upload, X, Plus, Check } from "lucide-react";
import {
  searchPlaylists,
  createPlaylist,
  createVideo,
  initVideoUpload,
  completeVideoUpload,
  initThumbnailUpload,
} from "../../api/endpoints";
import { uploadFileToSignedUrl } from "../../api/uploadClient";
import { fetchCategories } from "../../redux/slices/categorySlice";
import { normalizeCategories } from "../../utils/categoryHelpers";
import { PERMISSIONS, hasPermission } from "../../utils/permissions";
import SelectDropdown from "../../components/SelectDropdown";
import { triggerNotificationHaptic, triggerHaptic } from "../../utils/haptics";

export default function VideoUpload() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { items: categoryItems } = useSelector((state) => state.categories);
  const { user } = useSelector((state) => state.auth);
  const categories = normalizeCategories(categoryItems);

  const videoInputRef = useRef(null);
  const thumbInputRef = useRef(null);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [playlistQuery, setPlaylistQuery] = useState("");
  const [selectedPlaylist, setSelectedPlaylist] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [videoFile, setVideoFile] = useState(null);
  const [thumbnailFile, setThumbnailFile] = useState(null);
  const [videoPreview, setVideoPreview] = useState(null);
  const [thumbPreview, setThumbPreview] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  useEffect(() => {
    dispatch(fetchCategories());
  }, [dispatch]);

  useEffect(() => {
    if (!hasPermission(user, PERMISSIONS.VIDEO_CREATE)) {
      navigate("/admin");
    }
  }, [navigate, user]);

  useEffect(() => {
    const search = async () => {
      if (playlistQuery.length < 1) {
        setSuggestions([]);
        return;
      }
      try {
        const res = await searchPlaylists(playlistQuery);
        setSuggestions(res.data);
      } catch (err) {
        console.error("Search error:", err);
      }
    };

    const debounce = setTimeout(search, 300);
    return () => clearTimeout(debounce);
  }, [playlistQuery]);

  const handleSelectPlaylist = (playlist) => {
    setSelectedPlaylist(playlist);
    setPlaylistQuery(playlist.name);
    setShowSuggestions(false);
  };

  const handleCreateNewPlaylist = async () => {
    if (!playlistQuery.trim()) return;
    try {
      const res = await createPlaylist({ name: playlistQuery.trim() });
      setSelectedPlaylist(res.data);
      setShowSuggestions(false);
      toast.success("Playlist created!");
      triggerNotificationHaptic("success");
    } catch (err) {
      toast.error(err.response?.data?.error || "Failed to create playlist");
      triggerNotificationHaptic("error");
    }
  };

  const handleVideoSelect = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setVideoFile(file);
      setVideoPreview(URL.createObjectURL(file));
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
    if (!title || !selectedPlaylist || !videoFile) {
      toast.error("Please fill all required fields");
      triggerNotificationHaptic("error");
      return;
    }

    setUploading(true);
    setUploadProgress(0);

    try {
      const videoInit = await initVideoUpload(videoFile);
      await uploadFileToSignedUrl(
        videoInit.data.uploadUrl,
        videoFile,
        setUploadProgress
      );
      const videoComplete = await completeVideoUpload(videoInit.data.objectKey);

      let thumbnailUrl = null;
      let thumbnailKey = null;
      if (thumbnailFile) {
        const thumbInit = await initThumbnailUpload(thumbnailFile);
        await uploadFileToSignedUrl(thumbInit.data.uploadUrl, thumbnailFile);
        thumbnailUrl = thumbInit.data.thumbnailUrl;
        thumbnailKey = thumbInit.data.objectKey;
      }

      const selectedCategoryItem = categories.find(
        (item) => item.id === Number(selectedCategory)
      );

      await createVideo({
        playlistId: selectedPlaylist.playlist_id,
        title,
        description,
        videoUrl: videoComplete.data.videoUrl,
        storageKey: videoComplete.data.objectKey,
        hlsManifestPath: videoComplete.data.hlsManifestPath,
        processingStatus: videoComplete.data.processingStatus,
        thumbnailUrl,
        thumbnailKey,
        category: selectedCategoryItem?.slug || null,
        categoryId: selectedCategory ? Number(selectedCategory) : null,
      });

      toast.success("Video uploaded successfully!");
      triggerNotificationHaptic("success");
      navigate("/admin");
    } catch (err) {
      console.error("Upload error:", err);
      toast.error(err.response?.data?.error || "Upload failed");
      triggerNotificationHaptic("error");
    } finally {
      setUploading(false);
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
            onClick={() => navigate("/admin")}
            className="p-2 hover:bg-gray-100 rounded-full"
          >
            <ArrowLeft className="w-5 h-5 text-[#002856]" />
          </button>
          <h1 className="text-xl font-bold text-[#002856]">Upload Video</h1>
        </div>
      </header>

      <form onSubmit={handleSubmit} className="p-4 space-y-6">
        <div>
          <label className="block text-[#002856] text-sm font-medium mb-2">
            Title *
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Enter video title"
            className="w-full bg-gray-50 text-[#002856] px-4 py-3 rounded-xl border border-gray-200 focus:border-[#edb843] outline-none"
          />
        </div>

        <div>
          <label className="block text-[#002856] text-sm font-medium mb-2">
            Description
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Enter description"
            rows={3}
            className="w-full bg-gray-50 text-[#002856] px-4 py-3 rounded-xl border border-gray-200 focus:border-[#edb843] outline-none resize-none"
          />
        </div>

        <div className="relative">
          <label className="block text-[#002856] text-sm font-medium mb-2">
            Playlist *
          </label>
          <input
            type="text"
            value={playlistQuery}
            onChange={(e) => {
              setPlaylistQuery(e.target.value);
              setSelectedPlaylist(null);
              setShowSuggestions(true);
            }}
            onFocus={() => setShowSuggestions(true)}
            placeholder="Search or create playlist"
            className="w-full bg-gray-50 text-[#002856] px-4 py-3 rounded-xl border border-gray-200 focus:border-[#edb843] outline-none"
          />
          {selectedPlaylist && (
            <Check className="absolute right-4 top-10 w-5 h-5 text-green-500" />
          )}
          {showSuggestions && playlistQuery && (
            <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-xl overflow-hidden shadow-lg">
              {suggestions.map((playlist) => (
                <button
                  key={playlist.playlist_id}
                  type="button"
                  onClick={() => handleSelectPlaylist(playlist)}
                  className="w-full text-left px-4 py-3 hover:bg-gray-50 text-[#002856]"
                >
                  {playlist.name}
                </button>
              ))}
              {!suggestions.some(
                (p) => p.name.toLowerCase() === playlistQuery.toLowerCase()
              ) && (
                <button
                  type="button"
                  onClick={handleCreateNewPlaylist}
                  className="w-full flex items-center gap-2 px-4 py-3 hover:bg-gray-50 text-[#edb843] font-medium"
                >
                  <Plus className="w-4 h-4" />
                  Create "{playlistQuery}"
                </button>
              )}
            </div>
          )}
        </div>

        <div>
          <label className="block text-[#002856] text-sm font-medium mb-2">
            Category
          </label>
          <SelectDropdown
            value={selectedCategory}
            onChange={setSelectedCategory}
            placeholder="Select a category"
            options={categories.map((cat) => ({ value: String(cat.id), label: cat.name }))}
          />
        </div>

        <div>
          <label className="block text-[#002856] text-sm font-medium mb-2">
            Video *
          </label>
          <input
            ref={videoInputRef}
            type="file"
            accept="video/*"
            onChange={handleVideoSelect}
            className="hidden"
          />
          {videoPreview ? (
            <div className="relative w-32 aspect-9/16 bg-gray-100 rounded-xl overflow-hidden">
              <video src={videoPreview} className="w-full h-full object-cover" />
              <button
                type="button"
                onClick={() => {
                  setVideoFile(null);
                  setVideoPreview(null);
                }}
                className="absolute top-2 right-2 w-8 h-8 bg-white/80 rounded-full flex items-center justify-center"
              >
                <X className="w-4 h-4 text-[#002856]" />
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => videoInputRef.current?.click()}
              className="w-32 aspect-9/16 bg-gray-50 border-2 border-dashed border-gray-300 rounded-xl flex flex-col items-center justify-center gap-2 hover:bg-gray-100 transition-colors"
            >
              <Upload className="w-8 h-8 text-gray-400" />
              <span className="text-gray-500">Select video</span>
            </button>
          )}
        </div>

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
            <div className="relative w-32 aspect-9/16 bg-gray-100 rounded-xl overflow-hidden">
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
              className="w-32 aspect-9/16 bg-gray-50 border-2 border-dashed border-gray-300 rounded-xl flex flex-col items-center justify-center gap-1"
            >
              <Upload className="w-5 h-5 text-gray-400" />
              <span className="text-gray-500 text-xs">Thumbnail</span>
            </button>
          )}
        </div>

        <motion.button
          type="submit"
          disabled={uploading}
          whileTap={{ scale: 0.98 }}
          className="w-full bg-[#edb843] text-[#002856] font-bold py-4 rounded-xl disabled:opacity-50"
        >
          {uploading ? <span>Uploading... {uploadProgress}%</span> : "Upload Video"}
        </motion.button>

        {uploading && (
          <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-[#edb843] transition-all"
              style={{ width: `${uploadProgress}%` }}
            />
          </div>
        )}
      </form>
    </motion.div>
  );
}
