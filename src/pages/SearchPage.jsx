import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Search, X, TrendingUp } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import VideoCardGrid from "../components/VideoCardGrid";
import { searchVideos } from "../api/endpoints";
import { fetchCategories } from "../redux/slices/categorySlice";
import { fetchFeatured } from "../redux/slices/featuredSlice";
import { normalizeCategories, findCategoryBySlug } from "../utils/categoryHelpers";
import { playSound } from "../utils/sounds";

export default function SearchPage() {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { items: categoryItems } = useSelector((state) => state.categories);
  const { section: featuredSection } = useSelector((state) => state.featured);

  const categories = normalizeCategories(categoryItems);
  const [searchParams] = useSearchParams();
  const categoryId = searchParams.get("category");
  const category = categoryId ? findCategoryBySlug(categories, categoryId) : null;

  const [query, setQuery] = useState(category ? category.name : "");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  useEffect(() => {
    dispatch(fetchCategories());
    dispatch(fetchFeatured());
  }, [dispatch]);

  useEffect(() => {
    if (category && !searched) {
      handleSearch(category.name);
    }
  }, [category, searched]);

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
    playSound("tap");
    navigate("/search");
    setQuery("");
    setResults([]);
    setSearched(false);
  };

  const trendingItems = featuredSection?.items?.slice(0, 5) || [];

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ type: "tween", duration: 0.15, ease: "easeOut" }}
      className="min-h-screen bg-white pb-[calc(80px+env(safe-area-inset-bottom))] overflow-x-hidden"
    >
      {/* Search bar section — slate bg flush with global header */}
      <div className="w-full px-4 pt-4 pb-4 bg-slate-100 flex flex-col gap-2.5">
        <div className="w-full px-3.5 py-3 bg-white rounded-xl shadow-sm border border-gray-200 flex justify-start items-center gap-2.5">
          <Search className="w-5 h-5 text-gray-400 shrink-0" />
          <input
            type="text"
            autoFocus={!category}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search"
            className="flex-1 bg-transparent outline-none text-neutral-900 text-base font-normal font-['Poppins'] leading-6 placeholder:text-gray-400"
          />
          {query && (
            <button
              onClick={() => (category ? clearCategory() : setQuery(""))}
              className="p-1 shrink-0"
            >
              <X className="w-4 h-4 text-gray-400" />
            </button>
          )}
        </div>

        {/* Category Badge */}
        {category && (
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-500 font-medium">Browsing:</span>
            <span
              className="px-2.5 py-0.5 rounded-full text-[10px] font-medium text-white"
              style={{ backgroundColor: category.color || "#002856" }}
            >
              {category.name}
            </span>
          </div>
        )}
      </div>

      <main className="w-full flex flex-col justify-start items-start">
        <AnimatePresence mode="wait">
          {!searched && !loading && (
            <motion.div
              key="explore-default"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="w-full"
            >
              {trendingItems.length > 0 && (
                <>
                  <div className="w-full px-4 pt-4 pb-2 flex items-center gap-2.5">
                    <TrendingUp className="w-4 h-4 text-[#002856]" />
                    <h2 className="text-neutral-900 text-base font-semibold font-['Poppins'] leading-6">
                      Trending
                    </h2>
                  </div>
                  <div className="w-full pl-4 pb-3">
                    <div className="flex gap-1.5 overflow-x-auto pr-4 pb-2 hide-scrollbar snap-x snap-mandatory">
                      {trendingItems.map((video, idx) => (
                        <div key={video.video_id} className="w-24 shrink-0 snap-start">
                          <VideoCardGrid video={video} index={idx} />
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              )}

              {trendingItems.length === 0 && (
                <div className="text-center py-16 w-full px-4">
                  <Search className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500 font-['Poppins']">
                    Search for videos, playlists, or topics.
                  </p>
                </div>
              )}
            </motion.div>
          )}

          {loading && (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="w-full flex justify-center py-12"
            >
              <div className="w-8 h-8 border-2 border-[#002856] border-t-transparent rounded-full animate-spin" />
            </motion.div>
          )}

          {!loading && searched && results.length === 0 && (
            <motion.div
              key="no-results"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-center py-16 w-full px-4"
            >
              <p className="text-gray-500 font-['Poppins']">
                No results found for "{query}"
              </p>
            </motion.div>
          )}

          {!loading && searched && results.length > 0 && (
            <motion.div
              key="results"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="w-full px-4 py-6"
            >
              <h2 className="text-neutral-900 text-base font-semibold font-['Poppins'] leading-6 mb-4">
                Results
              </h2>
              <div className="grid grid-cols-3 gap-1.5">
                {results.map((video, idx) => (
                  <VideoCardGrid key={video.video_id} video={video} index={idx} />
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </motion.div>
  );
}
