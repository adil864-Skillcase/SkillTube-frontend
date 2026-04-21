import { NavLink, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { Home, Compass, PlaySquare } from "lucide-react";

import { playSound } from "../utils/sounds";
import { triggerHaptic } from "../utils/haptics";

const navItems = [
  { path: "/", icon: Home, label: "Home" },
  { path: "/search", icon: Compass, label: "Explore" }, // Explore goes to SearchPage
  { path: "/profile/saved", icon: PlaySquare, label: "My Videos" },
];

export default function BottomNav() {
  const location = useLocation();
  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-[#083262] pb-[env(safe-area-inset-bottom)]">
      <nav className="w-full flex items-center justify-between px-2.5 py-4">
        {navItems.map(({ path, icon: Icon, label }) => {
          const isActive =
            location.pathname === path ||
            // Also highlight Explorer if typing in search
            (path === "/search" && location.pathname.startsWith("/search")) ||
            // Fallback highlight based on path starting logic
            (path !== "/" && location.pathname.startsWith(path));

          return (
            <NavLink
              key={path}
              to={path}
              onClick={() => {
                playSound("tap");
                triggerHaptic("light");
              }}
              className={`flex-1 flex flex-col items-center gap-1 ${
                isActive ? "opacity-100" : "opacity-50"
              }`}
            >
              <motion.div
                whileTap={{ scale: 0.85 }}
                className="relative flex flex-col items-center gap-1"
              >
                <Icon
                  className={`w-5 h-5 transition-colors duration-200 ${
                    isActive ? "text-amber-300" : "text-white"
                  }`}
                  strokeWidth={isActive ? 2.5 : 2}
                />
                <span
                  className={`text-center text-[10px] leading-3 font-['Poppins'] transition-colors duration-200 ${
                    isActive
                      ? "text-white font-semibold"
                      : "text-white font-normal"
                  }`}
                >
                  {label}
                </span>
                {isActive && (
                  <motion.div
                    layoutId="nav-indicator"
                    className="absolute -top-1 right-0 w-1.5 h-1.5 bg-amber-300 rounded-full"
                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                  />
                )}
              </motion.div>
            </NavLink>
          );
        })}
      </nav>
    </div>
  );
}
