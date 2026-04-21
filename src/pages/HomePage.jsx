import { useEffect, useMemo, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

import Header from "../components/Header";
import CategoryGrid from "../components/CategoryGrid";
import CategoryRow from "../components/CategoryRow";
import FeaturedSection from "../components/FeaturedSection";
import BottomNav from "../components/BottomNav";
import PullToRefreshIndicator from "../components/PullToRefreshIndicator";

import { fetchPlaylists } from "../redux/slices/playlistSlice";
import { fetchCategories } from "../redux/slices/categorySlice";
import { fetchFeatured } from "../redux/slices/featuredSlice";
import { normalizeCategories } from "../utils/categoryHelpers";
import { usePullToRefresh } from "../hooks/usePullToRefresh";

// Skeletons
import PlaylistRowSkeleton from "../components/skeletons/PlaylistRowSkeleton";

export default function HomePage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { items: playlists, loading } = useSelector((state) => state.playlists);
  const { items: categoryItems } = useSelector((state) => state.categories);
  const { section: featuredSection } = useSelector((state) => state.featured);
  const categories = useMemo(
    () => normalizeCategories(categoryItems),
    [categoryItems]
  );

  const loadAll = useCallback(() => {
    dispatch(fetchPlaylists());
    dispatch(fetchCategories());
    dispatch(fetchFeatured());
  }, [dispatch]);

  useEffect(() => {
    loadAll();
  }, [loadAll]);

  const handleRefresh = useCallback(() => {
    return new Promise((resolve) => {
      dispatch(fetchPlaylists());
      dispatch(fetchCategories());
      dispatch(fetchFeatured());
      // Give dispatches time to settle before hiding the spinner
      setTimeout(resolve, 1000);
    });
  }, [dispatch]);

  const { pullProgress, isRefreshing, containerProps } =
    usePullToRefresh(handleRefresh);

  // Get all videos with playlist slug. Inherit playlist's category if video has none.
  const allVideos = useMemo(() => {
    return playlists.flatMap((p) =>
      (p.videos || []).map((v) => ({
        ...v,
        playlist_slug: p.slug,
        category: v.category || p.category || null,
        category_id: v.category_id || p.category_id || null,
      }))
    );
  }, [playlists]);

  // Group videos by category — index by slug AND by category_id string
  const videosByCategory = useMemo(() => {
    const grouped = {};
    allVideos.forEach((video) => {
      if (video.category) {
        const key = video.category.toLowerCase();
        if (!grouped[key]) grouped[key] = [];
        grouped[key].push(video);
      }
      if (video.category_id) {
        const idKey = String(video.category_id);
        if (!grouped[idKey]) grouped[idKey] = [];
        grouped[idKey].push(video);
      }
    });
    return grouped;
  }, [allVideos]);

  // Get categories that have videos (in original order)
  const categoriesWithVideos = useMemo(() => {
    return categories.filter(
      (cat) =>
        videosByCategory[cat.slug?.toLowerCase()]?.length > 0 ||
        videosByCategory[String(cat.id)]?.length > 0
    );
  }, [categories, videosByCategory]);

  const handleCategorySelect = (category) => {
    navigate(`/category/${category.slug}`);
  };

  if (loading && playlists.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 pb-[calc(64px+env(safe-area-inset-bottom))]">
        <main className="pb-4">
          <PlaylistRowSkeleton />
          <PlaylistRowSkeleton />
          <PlaylistRowSkeleton />
        </main>
      </div>
    );
  }

  return (
    <div className="relative overflow-hidden">
      {/* Pull-to-refresh indicator — rendered above the scrollable content */}
      <PullToRefreshIndicator
        pullProgress={pullProgress}
        isRefreshing={isRefreshing}
      />

      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -20 }}
        transition={{ type: "tween", duration: 0.15, ease: "easeOut" }}
        className="min-h-screen bg-white pb-[calc(80px+env(safe-area-inset-bottom))] overflow-x-hidden overflow-y-auto"
        {...containerProps}
      >
        <main className="w-full flex flex-col justify-start items-start">
          {/* Featured Section directly under header */}
          <FeaturedSection section={featuredSection} />

          {/* Categories Grid */}
          <div className="w-full px-4 py-6 bg-white">
            <CategoryGrid categories={categories} onSelect={handleCategorySelect} />
          </div>

          {/* Category Rows rendering videos horizontally */}
          {categoriesWithVideos.map((category) => (
            <CategoryRow
              key={category.id}
              category={category}
              videos={
                videosByCategory[category.slug?.toLowerCase()] ||
                videosByCategory[String(category.id)]
              }
            />
          ))}

          {allVideos.length === 0 && (
            <div className="text-center py-12 w-full">
              <p className="text-gray-500">No content available yet</p>
            </div>
          )}
        </main>

        <BottomNav />
      </motion.div>
    </div>
  );
}
