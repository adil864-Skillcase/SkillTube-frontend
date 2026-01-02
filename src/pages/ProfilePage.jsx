import { useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Settings,
  Heart,
  Bookmark,
  LogOut,
  ChevronRight,
} from "lucide-react";

import { logout } from "../redux/slices/authSlice";

export default function ProfilePage() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user, isAuthenticated } = useSelector((state) => state.auth);

  if (!isAuthenticated) {
    navigate("/login");
    return null;
  }

  const handleLogout = () => {
    dispatch(logout());
    navigate("/");
  };

  const menuItems = [
    user?.role === "admin" && {
      icon: Settings,
      label: "Admin Dashboard",
      href: "/admin",
      iconColor: "text-[#edb843]",
      bgColor: "bg-[#edb843]/10",
    },
    {
      icon: Heart,
      label: "Liked Videos",
      href: "/profile/liked",
      iconColor: "text-pink-500",
      bgColor: "bg-pink-50",
    },
    {
      icon: Bookmark,
      label: "Saved Videos",
      href: "/profile/saved",
      iconColor: "text-blue-500",
      bgColor: "bg-blue-50",
    },
  ].filter(Boolean);

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ type: "tween", duration: 0.15, ease: "easeOut" }}
      className="min-h-screen bg-white safe-bottom"
    >
      {/* Header */}
      <header className="flex items-center gap-4 p-4 border-b border-gray-100">
        <button
          onClick={() => navigate(-1)}
          className="p-2 hover:bg-gray-100 rounded-full"
        >
          <ArrowLeft className="w-5 h-5 text-[#002856]" />
        </button>
        <h1 className="text-xl font-bold text-[#002856]">Profile</h1>
      </header>

      {/* Avatar Section */}
      <div className="flex flex-col items-center py-8">
        <div className="w-24 h-24 rounded-full bg-[#edb843] flex items-center justify-center border-4 border-[#edb843]/30">
          <span className="text-4xl font-bold text-[#002856]">
            {user?.name?.[0]?.toUpperCase() || "U"}
          </span>
        </div>
        <h2 className="text-xl font-bold text-[#002856] mt-4">
          {user?.name || "User"}
        </h2>
        <p className="text-gray-500">{user?.phoneNumber}</p>
      </div>

      {/* Menu Items */}
      <div className="px-4 space-y-3">
        {menuItems.map((item) => (
          <motion.button
            key={item.label}
            whileTap={{ scale: 0.98 }}
            onClick={() => navigate(item.href)}
            className="w-full flex items-center justify-between p-4 bg-white border border-gray-100 rounded-2xl shadow-sm"
          >
            <div className="flex items-center gap-4">
              <div
                className={`w-10 h-10 ${item.bgColor} rounded-xl flex items-center justify-center`}
              >
                <item.icon className={`w-5 h-5 ${item.iconColor}`} />
              </div>
              <span className="font-medium text-[#002856]">{item.label}</span>
            </div>
            <ChevronRight className="w-5 h-5 text-gray-400" />
          </motion.button>
        ))}
      </div>

      {/* Logout */}
      <div className="px-4 mt-8">
        <motion.button
          whileTap={{ scale: 0.98 }}
          onClick={handleLogout}
          className="w-full flex items-center justify-between p-4 bg-white border border-gray-100 rounded-2xl shadow-sm"
        >
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-red-50 rounded-xl flex items-center justify-center">
              <LogOut className="w-5 h-5 text-red-500" />
            </div>
            <span className="font-medium text-red-500">Log Out</span>
          </div>
          <ChevronRight className="w-5 h-5 text-gray-400" />
        </motion.button>
      </div>
    </motion.div>
  );
}
