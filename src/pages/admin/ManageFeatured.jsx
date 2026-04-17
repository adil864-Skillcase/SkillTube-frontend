import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Search, X } from "lucide-react";
import { useSelector } from "react-redux";
import toast from "react-hot-toast";
import { updateFeaturedSection, getHomeFeatured, searchVideos, getVideoById } from "../../api/endpoints";
import { PERMISSIONS, hasPermission } from "../../utils/permissions";

const MODE_OPTIONS = [
  "manual",
  "most_viewed",
  "most_liked",
  "most_commented",
  "newest",
  "trending",
];

export default function ManageFeatured() {
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const [sectionId, setSectionId] = useState("");
  const [title, setTitle] = useState("Featured");
  const [mode, setMode] = useState("most_viewed");
  const [maxItems, setMaxItems] = useState(5);
  
  // Visual search states
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);
  
  // Selected videos for manual mode
  const [selectedVideos, setSelectedVideos] = useState([]);

  if (!hasPermission(user, PERMISSIONS.FEATURED_MANAGE)) {
    navigate("/admin");
    return null;
  }

  const loadCurrent = async () => {
    try {
      const res = await getHomeFeatured();
      setSectionId(String(res.data.sectionId || ""));
      setTitle(res.data.title || "Featured");
      setMode(res.data.mode || "most_viewed");
      setMaxItems(res.data.maxItems || 5);
      
      if (res.data.mode === "manual" && res.data.items) {
        setSelectedVideos(res.data.items);
      }
    } catch (err) {
      toast.error("Failed to fetch featured settings");
    }
  };

  // Debounced search effect
  useEffect(() => {
    const timer = setTimeout(async () => {
      if (!searchQuery.trim() || mode !== "manual") {
        setSearchResults([]);
        return;
      }
      setSearching(true);
      try {
        const res = await searchVideos(searchQuery);
        // exclude already selected
        const filtered = res.data.filter(
          v => !selectedVideos.some(sv => String(sv.video_id) === String(v.video_id))
        );
        setSearchResults(filtered || []);
      } catch (err) {
        // fail silently for search
      } finally {
        setSearching(false);
      }
    }, 400);
    return () => clearTimeout(timer);
  }, [searchQuery, selectedVideos, mode]);

  const handleSelectVideo = (video) => {
    if (selectedVideos.length >= maxItems) {
      toast.error(`Maximum items allowed is ${maxItems}`);
      return;
    }
    setSelectedVideos(prev => [...prev, video]);
    setSearchQuery("");
    setSearchResults([]);
  };

  const handleRemoveVideo = (videoId) => {
    setSelectedVideos(prev => prev.filter(v => String(v.video_id) !== String(videoId)));
  };

  const handleSave = async () => {
    if (!sectionId) {
      toast.error("Load current section first");
      return;
    }
    try {
      const manualVideoIds = selectedVideos.map(v => v.video_id);

      await updateFeaturedSection(sectionId, {
        title,
        mode,
        maxItems: Number(maxItems),
        manualVideoIds: mode === "manual" ? manualVideoIds : undefined,
      });
      toast.success("Featured section updated");
    } catch (err) {
      toast.error(err.response?.data?.error || "Failed to update featured section");
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
          <button onClick={() => navigate("/admin")} className="p-2 hover:bg-gray-100 rounded-full">
            <ArrowLeft className="w-5 h-5 text-[#002856]" />
          </button>
          <h1 className="text-xl font-bold text-[#002856]">Featured Section</h1>
        </div>
      </header>

      <div className="p-4 space-y-4 pb-20">
        <button
          onClick={loadCurrent}
          className="w-full py-3 rounded-xl border border-[#002856]/20 bg-[#002856]/5 text-[#002856] font-semibold active:bg-[#002856]/10"
        >
          Load Current Config
        </button>

        <div className="space-y-3 p-4 bg-gray-50 border border-gray-100 rounded-2xl">
          <div>
            <label className="block text-sm font-semibold text-[#002856] mb-1.5">Section Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Trending Now"
              className="w-full px-4 py-3 border border-gray-200 rounded-xl outline-none focus:border-[#edb843]"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-semibold text-[#002856] mb-1.5">Sorting Mode</label>
              <select
                value={mode}
                onChange={(e) => setMode(e.target.value)}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-white outline-none focus:border-[#edb843]"
              >
                {MODE_OPTIONS.map((modeValue) => (
                  <option key={modeValue} value={modeValue}>
                    {modeValue.replace("_", " ").toUpperCase()}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-[#002856] mb-1.5">Max Items Capacity</label>
              <input
                type="number"
                min="1"
                max="20"
                value={maxItems}
                onChange={(e) => setMaxItems(e.target.value)}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl outline-none focus:border-[#edb843]"
              />
            </div>
          </div>
        </div>

        {mode === "manual" && (
          <div className="space-y-3 p-4 border border-[#edb843]/50 bg-[#edb843]/5 rounded-2xl">
            <label className="block text-sm font-semibold text-[#002856]">Manual Video Selection</label>
            
            {/* Search Input */}
            <div className="relative">
              <div className="flex items-center px-4 py-3 bg-white border border-gray-200 rounded-xl focus-within:border-[#edb843] focus-within:ring-1 focus-within:ring-[#edb843]">
                <Search className="w-5 h-5 text-gray-400 mr-2 shrink-0" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search video title..."
                  className="w-full bg-transparent outline-none text-[#002856]"
                />
                {searching && <div className="w-4 h-4 border-2 border-[#edb843] border-t-transparent rounded-full animate-spin shrink-0" />}
              </div>

              {/* Autocomplete Dropdown */}
              <AnimatePresence>
                {searchQuery.trim() && searchResults.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="absolute z-20 left-0 right-0 mt-2 bg-white rounded-xl shadow-lg border border-gray-100 max-h-60 overflow-y-auto"
                  >
                    {searchResults.map((v) => (
                      <button
                        key={v.video_id}
                        onClick={() => handleSelectVideo(v)}
                        className="w-full text-left px-4 py-3 hover:bg-gray-50 flex items-center gap-3 border-b border-gray-50 last:border-0"
                      >
                        <div className="w-12 h-16 shrink-0 rounded bg-gray-100 overflow-hidden">
                          {v.thumbnail_url && <img src={v.thumbnail_url} className="w-full h-full object-cover" />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-sm text-[#002856] truncate">{v.title}</p>
                          <p className="text-xs text-gray-400 truncate">{v.playlist_name}</p>
                        </div>
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Selected Chips List */}
            {selectedVideos.length > 0 && (
              <div className="flex flex-col gap-2 mt-4">
                <p className="text-xs text-gray-500 font-medium">Selected Videos ({selectedVideos.length}/{maxItems})</p>
                {selectedVideos.map((v, i) => (
                  <div key={v.video_id} className="flex items-center gap-3 p-2 bg-white border border-[#edb843]/30 rounded-xl shadow-sm">
                    <span className="w-6 text-center text-xs font-bold text-[#edb843]">{i + 1}</span>
                    <div className="w-10 h-10 shrink-0 rounded bg-gray-100 overflow-hidden">
                      {v.thumbnail_url && <img src={v.thumbnail_url} className="w-full h-full object-cover" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm text-[#002856] truncate">{v.title}</p>
                    </div>
                    <button 
                      onClick={() => handleRemoveVideo(v.video_id)}
                      className="p-2 hover:bg-red-50 text-red-500 rounded-lg shrink-0"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        <button
          onClick={handleSave}
          className="w-full py-4 bg-[#edb843] text-[#002856] rounded-xl font-bold text-lg active:opacity-80 transition-opacity"
        >
          Save Configuration
        </button>
      </div>
    </motion.div>
  );
}
