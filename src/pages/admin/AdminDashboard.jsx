import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Plus,
  Video,
  ListMusic,
  Grid3X3,
  Shield,
  Star,
  Users,
  BellRing,
} from "lucide-react";
import { useSelector } from "react-redux";
import toast from "react-hot-toast";
import { getDashboardStats } from "../../api/endpoints";
import { PERMISSIONS, hasPermission } from "../../utils/permissions";

export default function AdminDashboard() {
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);

  const [stats, setStats] = useState({
    totalUsers: 0,
    totalCategories: 0,
    totalPlaylists: 0,
    totalVideos: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user || (user.role !== "admin" && user.role !== "super_admin")) {
      navigate("/");
      return;
    }
    fetchStats();
  }, [navigate, user]);

  const fetchStats = async () => {
    try {
      const res = await getDashboardStats();
      setStats(res.data);
    } catch (err) {
      console.error("Failed to fetch stats:", err);
    } finally {
      setLoading(false);
    }
  };

  const canManagePlaylist = hasPermission(user, PERMISSIONS.PLAYLIST_MANAGE);
  const canCreateVideo = hasPermission(user, PERMISSIONS.VIDEO_CREATE);
  const canDeleteVideo = hasPermission(user, PERMISSIONS.VIDEO_DELETE);
  const canManageCategories = hasPermission(user, PERMISSIONS.CATEGORY_MANAGE);
  const canManageAdmin = hasPermission(
    user,
    PERMISSIONS.ADMIN_MANAGE_PERMISSIONS,
  );
  const canManageNotifications = hasPermission(
    user,
    PERMISSIONS.NOTIFICATION_MANAGE,
  );

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
            onClick={() => navigate("/")}
            className="p-2 hover:bg-gray-100 rounded-full"
          >
            <ArrowLeft className="w-5 h-5 text-[#002856]" />
          </button>
          <h1 className="text-xl font-bold text-[#002856]">Admin Dashboard</h1>
        </div>
      </header>

      {loading ? (
        <div className="flex items-center justify-center p-20">
          <div className="w-8 h-8 border-2 border-[#edb843] border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <div className="space-y-8 pb-20 max-w-5xl mx-auto w-full px-2 md:px-6">
          {/* OVERVIEW SECTION FIRST */}
          <div className="p-4 pt-6">
            <h2 className="text-gray-500 text-sm font-bold mb-4 uppercase tracking-wider">
              Overview
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
              <div className="p-5 bg-[#002856] rounded-2xl shadow-sm flex flex-col justify-between aspect-4/3 hover:scale-[1.02] transition-transform ">
                <div className="w-8 h-8 bg-white/10 rounded-full flex items-center justify-center">
                  <Users className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-4xl font-bold text-white mb-1 mt-2">
                    {stats.totalUsers}
                  </p>
                  <p className="text-white/70 text-sm font-medium">
                    Total Users
                  </p>
                </div>
              </div>
              <div className="p-5 bg-[#002856] rounded-2xl shadow-sm flex flex-col justify-between aspect-4/3 hover:scale-[1.02] transition-transform">
                <div className="w-8 h-8 bg-white/10 rounded-full flex items-center justify-center">
                  <Grid3X3 className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-4xl font-bold text-white mb-1 mt-2">
                    {stats.totalCategories}
                  </p>
                  <p className="text-white/70 text-sm font-medium">
                    Categories
                  </p>
                </div>
              </div>
              <div className="p-5 bg-[#edb843] rounded-2xl shadow-sm flex flex-col justify-between aspect-4/3 hover:scale-[1.02] transition-transform">
                <div className="w-8 h-8 bg-[#002856]/10 rounded-full flex items-center justify-center">
                  <ListMusic className="w-5 h-5 text-[#002856]" />
                </div>
                <div>
                  <p className="text-4xl font-bold text-[#002856] mb-1 mt-2">
                    {stats.totalPlaylists}
                  </p>
                  <p className="text-[#002856]/70 text-sm font-semibold">
                    Playlists
                  </p>
                </div>
              </div>
              <div className="p-5 bg-[#edb843] rounded-2xl shadow-sm flex flex-col justify-between aspect-4/3 hover:scale-[1.02] transition-transform">
                <div className="w-8 h-8 bg-[#002856]/10 rounded-full flex items-center justify-center">
                  <Video className="w-5 h-5 text-[#002856]" />
                </div>
                <div>
                  <p className="text-4xl font-bold text-[#002856] mb-1 mt-2">
                    {stats.totalVideos}
                  </p>
                  <p className="text-[#002856]/70 text-sm font-semibold">
                    Total Videos
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* QUICK ACTIONS SECTION SECOND */}
          <div className="p-4">
            <h2 className="text-gray-500 text-sm font-bold mb-4 uppercase tracking-wider">
              Quick Actions
            </h2>
            <div className="grid grid-cols-3 md:grid-cols-6 gap-3 md:gap-4">
              {canCreateVideo && (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => navigate("/admin/upload")}
                  className="flex flex-col items-center justify-center gap-2 aspect-square bg-[#002856]/5 border border-[#002856]/10 rounded-2xl hover:bg-[#002856]/10 transition-all shadow-sm"
                >
                  <Plus className="w-7 h-7 text-[#002856]" />
                  <span className="text-[#002856] font-semibold text-xs md:text-sm">
                    Upload
                  </span>
                </motion.button>
              )}
              {canManagePlaylist && (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => navigate("/admin/playlists")}
                  className="flex flex-col items-center justify-center gap-2 aspect-square bg-[#002856]/5 border border-[#002856]/10 rounded-2xl hover:bg-[#002856]/10 transition-all shadow-sm"
                >
                  <ListMusic className="w-7 h-7 text-[#002856]" />
                  <span className="text-[#002856] font-semibold text-xs md:text-sm">
                    Playlists
                  </span>
                </motion.button>
              )}
              {(hasPermission(user, PERMISSIONS.VIDEO_EDIT) ||
                canDeleteVideo) && (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => navigate("/admin/videos")}
                  className="flex flex-col items-center justify-center gap-2 aspect-square bg-[#002856]/5 border border-[#002856]/10 rounded-2xl hover:bg-[#002856]/10 transition-all shadow-sm"
                >
                  <Video className="w-7 h-7 text-[#002856]" />
                  <span className="text-[#002856] font-semibold text-xs md:text-sm">
                    Videos
                  </span>
                </motion.button>
              )}
              {canManageCategories && (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => navigate("/admin/categories")}
                  className="flex flex-col items-center justify-center gap-2 aspect-square bg-[#002856]/5 border border-[#002856]/10 rounded-2xl hover:bg-[#002856]/10 transition-all shadow-sm"
                >
                  <Grid3X3 className="w-7 h-7 text-[#002856]" />
                  <span className="text-[#002856] font-semibold text-xs md:text-sm">
                    Categories
                  </span>
                </motion.button>
              )}
              {hasPermission(user, PERMISSIONS.FEATURED_MANAGE) && (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => navigate("/admin/featured")}
                  className="flex flex-col items-center justify-center gap-2 aspect-square bg-[#002856]/5 border border-[#002856]/10 rounded-2xl hover:bg-[#002856]/10 transition-all shadow-sm"
                >
                  <Star className="w-7 h-7 text-[#edb843]" />
                  <span className="text-[#002856] font-semibold text-xs md:text-sm">
                    Featured
                  </span>
                </motion.button>
              )}
              {canManageAdmin && (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => navigate("/admin/permissions")}
                  className="flex flex-col items-center justify-center gap-2 aspect-square bg-[#002856]/5 border border-[#002856]/10 rounded-2xl hover:bg-[#002856]/10 transition-all shadow-sm"
                >
                  <Shield className="w-7 h-7 text-[#002856]" />
                  <span className="text-[#002856] font-semibold text-xs md:text-sm">
                    Permissions
                  </span>
                </motion.button>
              )}
              {canManageNotifications && (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => navigate("/admin/notifications")}
                  className="flex flex-col items-center justify-center gap-2 aspect-square bg-[#002856]/5 border border-[#002856]/10 rounded-2xl hover:bg-[#002856]/10 transition-all shadow-sm"
                >
                  <BellRing className="w-7 h-7 text-[#002856]" />
                  <span className="text-[#002856] font-semibold text-xs md:text-sm text-center leading-tight">
                    Push<br />Alerts
                  </span>
                </motion.button>
              )}
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
}
