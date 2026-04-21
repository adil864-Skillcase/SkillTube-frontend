import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Bell, User } from "lucide-react";
import { useSelector } from "react-redux";

import { playSound } from "../utils/sounds";

export default function Header() {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useSelector((state) => state.auth);

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-zinc-100 h-16 w-full flex flex-col justify-center shadow-md">
      <div className="w-full px-4 pr-3 flex justify-between items-center">
        <motion.button
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => {
            playSound("tap");
            navigate("/");
          }}
          className="text-2xl font-extrabold text-blue-950 flex items-center justify-center outline-none"
        >
          Skill<span className="text-[#edb843]">Snap</span>
        </motion.button>

        {/* Actions Menu */}
        <div className="flex justify-start items-center gap-4">
          {isAuthenticated ? (
            <motion.div
              whileTap={{ scale: 0.9 }}
              onClick={() => {
                playSound("tap");
                navigate("/profile");
              }}
              className="w-9 h-9 rounded-full border border-black/10 flex items-center justify-center bg-[#edb843] cursor-pointer"
            >
              <span className="text-sm font-bold text-[#002856]">
                {user?.name?.[0]?.toUpperCase() || "U"}
              </span>
            </motion.div>
          ) : (
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                playSound("tap");
                navigate("/login");
              }}
              className="w-9 h-9 rounded-full border border-black/10 flex items-center justify-center bg-gray-100 text-[#002856]"
            >
              <User className="w-5 h-5 text-gray-500" />
            </motion.button>
          )}
        </div>
      </div>
    </header>
  );
}
