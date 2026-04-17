import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { useEffect } from "react";
import { Toaster } from "react-hot-toast";
import { AnimatePresence } from "framer-motion";

// Pages
import HomePage from "./pages/HomePage";
import NewReleasesPage from "./pages/NewReleasesPage";
import ProfilePage from "./pages/ProfilePage";
import LikedVideosPage from "./pages/LikedVideosPage";
import SavedVideosPage from "./pages/SavedVideosPage";
import PlayerPage from "./pages/PlayerPage";
import LoginPage from "./pages/LoginPage";
import SearchPage from "./pages/SearchPage";
import AdminDashboard from "./pages/admin/AdminDashboard";
import VideoUpload from "./pages/admin/VideoUpload";
import ManagePlaylist from "./pages/admin/ManagePlaylist";
import ManageVideos from "./pages/admin/ManageVideos";
import EditPlaylist from "./pages/admin/EditPlaylist";
import EditVideo from "./pages/admin/EditVideo";
import ManageCategories from "./pages/admin/ManageCategories";
import CreateCategory from "./pages/admin/CreateCategory";
import EditCategory from "./pages/admin/EditCategory";
import AdminPermissions from "./pages/admin/AdminPermissions";
import ManageFeatured from "./pages/admin/ManageFeatured";
import CategoryPage from "./pages/CategoryPage";
import PlaylistDetailPage from "./pages/PlaylistDetailPage";

// Components
import BottomNav from "./components/BottomNav";
import Header from "./components/Header";

// Utils
import { initSounds } from "./utils/sounds";

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [pathname]);
  return null;
}

function AppContent() {
  const location = useLocation();

  const hideNav =
    ["/player", "/login", "/admin", "/category", "/playlist"].some((p) =>
      location.pathname.startsWith(p)
    );

  // Show the persistent global header only on the main tab pages
  const showHeader = !hideNav;

  return (
    <>
      <ScrollToTop />
      {showHeader && <Header />}
      <div className="overflow-hidden">
        <AnimatePresence mode="wait">
          <Routes location={location} key={location.pathname}>
            <Route path="/" element={<HomePage />} />
            <Route path="/new" element={<NewReleasesPage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/profile/liked" element={<LikedVideosPage />} />
            <Route path="/profile/saved" element={<SavedVideosPage />} />
            <Route path="/search" element={<SearchPage />} />
            <Route path="/player/:slug" element={<PlayerPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/admin/upload" element={<VideoUpload />} />
            <Route path="/admin/playlists" element={<ManagePlaylist />} />
            <Route path="/admin/playlists/edit/:id" element={<EditPlaylist />} />
            <Route path="/admin/videos" element={<ManageVideos />} />
            <Route path="/admin/videos/edit/:id" element={<EditVideo />} />
            <Route path="/admin/categories" element={<ManageCategories />} />
            <Route path="/admin/categories/create" element={<CreateCategory />} />
            <Route path="/admin/categories/edit/:id" element={<EditCategory />} />
            <Route path="/admin/permissions" element={<AdminPermissions />} />
            <Route path="/admin/featured" element={<ManageFeatured />} />
            <Route path="/category/:categoryId" element={<CategoryPage />} />
            <Route path="/playlist/:slug" element={<PlaylistDetailPage />} />
          </Routes>
        </AnimatePresence>
      </div>
      {!hideNav && <BottomNav />}
    </>
  );
}

export default function App() {
  useEffect(() => {
    initSounds();
  }, []);

  return (
    <BrowserRouter>
      <Toaster position="top-right" />
      <AppContent />
    </BrowserRouter>
  );
}
