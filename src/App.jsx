import { BrowserRouter, Routes, Route, useLocation, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Toaster } from "react-hot-toast";
import { AnimatePresence } from "framer-motion";
import { Capacitor } from "@capacitor/core";
import { App as CapacitorApp } from "@capacitor/app";
import { SplashScreen } from "@capacitor/splash-screen";
import { Fullscreen } from "@boengli/capacitor-fullscreen";

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
import SendNotification from "./pages/admin/SendNotification";

// Components
import BottomNav from "./components/BottomNav";
import Header from "./components/Header";

// Utils
import { initSounds } from "./utils/sounds";
import { initPushNotifications } from "./services/notifications";
import { getMe } from "./api/endpoints";
import { setUser } from "./redux/slices/authSlice";

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [pathname]);
  return null;
}

function AppNativeListeners() {
  const navigate = useNavigate();

  useEffect(() => {
    if (!Capacitor.isNativePlatform()) return;

    // Handle deep links (skillsnap://...)
    const urlListener = CapacitorApp.addListener("appUrlOpen", (data) => {
      // The incoming URL might be 'skillsnap://app/playlist/slug'
      if (data.url.startsWith("skillsnap://app")) {
        const path = data.url.replace("skillsnap://app", "");
        navigate(path);
      }
    });

    // Handle Hardware Back Button
    const backBtnListener = CapacitorApp.addListener("backButton", ({ canGoBack }) => {
      if (!canGoBack || window.location.pathname === "/") {
        CapacitorApp.exitApp();
      } else {
        navigate(-1);
      }
    });

    return () => {
      urlListener.then(l => l.remove());
      backBtnListener.then(l => l.remove());
    };
  }, [navigate]);

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
    <div className="safe-top">
      <ScrollToTop />
      <AppNativeListeners />
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
            <Route path="/admin/notifications" element={<SendNotification />} />
            <Route path="/category/:categoryId" element={<CategoryPage />} />
            <Route path="/playlist/:slug" element={<PlaylistDetailPage />} />
          </Routes>
        </AnimatePresence>
      </div>
      {!hideNav && <BottomNav />}
    </div>
  );
}

export default function App() {
  const { token } = useSelector((state) => state.auth);
  const dispatch = useDispatch();

  useEffect(() => {
    initSounds();

    if (Capacitor.isNativePlatform()) {
      // Hide splash screen after app has mounted and React is ready
      SplashScreen.hide({ fadeOutDuration: 300 }).catch(console.warn);

      // Enable immersive fullscreen — hides status bar and navigation bar
      Fullscreen.activateImmersiveMode().catch((e) => console.warn("Fullscreen error:", e));
    }
  }, []);

  // Initialise push notifications and fetch latest user details once authenticated
  useEffect(() => {
    if (token) {
      initPushNotifications(token);
      
      // Fetch fresh user data (permissions, super_admin status, etc) silently
      getMe()
        .then((res) => {
          if (res.data) dispatch(setUser(res.data));
        })
        .catch((err) => {
          console.error("Failed to fetch fresh user data", err);
        });
    }
  }, [token, dispatch]);

  return (
    <BrowserRouter>
      <Toaster position="top-right" />
      <AppContent />
    </BrowserRouter>
  );
}
