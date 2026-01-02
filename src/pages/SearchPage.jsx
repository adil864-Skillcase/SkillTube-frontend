import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Search, X } from "lucide-react";
import VideoCardGrid from "../components/VideoCardGrid";
import { searchVideos } from "../api/endpoints";
import { getCategoryById } from "../constants/categories";

export default function SearchPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const categoryId = searchParams.get("category");
  const category = categoryId ? getCategoryById(categoryId) : null;

  const [query, setQuery] = useState(category ? category.name : "");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  useEffect(() => {
    // Auto-search when category is selected from URL
    if (category && !searched) {
      handleSearch(category.name);
    }
  }, [category]);

  useEffect(() => {
    const debounce = setTimeout(() => {
      if (query.length >= 2) {
        handleSearch(query);
      } else if (!category) {
        setResults([]);
        setSearched(false);
      }
    }, 300);
    return () => clearTimeout(debounce);
  }, [query]);

  const handleSearch = async (searchQuery) => {
    setLoading(true);
    try {
      const res = await searchVideos(searchQuery || query);
      setResults(res.data);
      setSearched(true);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const clearCategory = () => {
    navigate("/search");
    setQuery("");
    setResults([]);
    setSearched(false);
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ type: "tween", duration: 0.15, ease: "easeOut" }}
      className="min-h-screen bg-white"
    >
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white border-b border-gray-100 p-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="p-2 hover:bg-gray-100 rounded-full"
          >
            <ArrowLeft className="w-5 h-5 text-[#002856]" />
          </button>
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search videos..."
              className="w-full bg-gray-100 rounded-xl pl-12 pr-10 py-3 outline-none text-[#002856] placeholder:text-gray-400"
            />
            {query && (
              <button
                onClick={() => category ? clearCategory() : setQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2"
              >
                <X className="w-5 h-5 text-gray-400" />
              </button>
            )}
          </div>
        </div>

        {/* Category Badge */}
        {category && (
          <div className="mt-3 flex items-center gap-2">
            <span className="text-sm text-gray-500">Browsing:</span>
            <span
              className="px-3 py-1 rounded-full text-sm font-medium text-white"
              style={{ backgroundColor: category.color }}
            >
              {category.name}
            </span>
          </div>
        )}
      </header>

      {/* Results */}
      <main className="p-4">
        {loading && (
          <div className="flex justify-center py-8">
            <div className="w-8 h-8 border-2 border-[#edb843] border-t-transparent rounded-full animate-spin" />
          </div>
        )}

        {!loading && searched && results.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">No results for "{query}"</p>
          </div>
        )}

        {!loading && results.length > 0 && (
          <div className="grid grid-cols-3 gap-3">
            {results.map((video, idx) => (
              <VideoCardGrid key={video.video_id} video={video} index={idx} />
            ))}
          </div>
        )}

        {!searched && !loading && (
          <div className="text-center py-12">
            <Search className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">Search for videos about Germany</p>
          </div>
        )}
      </main>
    </motion.div>
  );
}
