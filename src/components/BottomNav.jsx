import { NavLink, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { Home, Compass, Bookmark, User } from "lucide-react";

import { playSound } from "../utils/sounds";

const navItems = [
  { path: "/", icon: Home, label: "Home" },
  { path: "/new", icon: Compass, label: "Explore" },
  { path: "/profile", icon: User, label: "Profile" },
];

export default function BottomNav() {
  const location = useLocation();
  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-4 pb-[calc(16px+env(safe-area-inset-bottom))]">
      {/* Floating glass container */}
      <nav className="glass-nav mx-auto max-w-md flex items-center justify-around h-16 rounded-2xl px-2">
        {navItems.map(({ path, icon: Icon, label }) => {
          const isActive = location.pathname === path;
          return (
            <NavLink
              key={path}
              to={path}
              onClick={() => playSound("tap")}
              className="relative flex flex-col items-center justify-center w-16 h-12"
            >
              {/* Active background pill */}
              {isActive && (
                <motion.div
                  layoutId="nav-pill"
                  className="absolute inset-0 bg-[#edb843]/20 rounded-xl"
                  transition={{ type: "spring", stiffness: 500, damping: 35 }}
                />
              )}

              <motion.div
                whileTap={{ scale: 0.9 }}
                className="relative z-10 flex flex-col items-center gap-0.5"
              >
                <Icon
                  className={`w-6 h-6 transition-all duration-200 ${
                    isActive ? "text-[#edb843]" : "text-gray-400"
                  }`}
                  strokeWidth={2}
                />
              </motion.div>
            </NavLink>
          );
        })}
      </nav>
    </div>
  );
}
