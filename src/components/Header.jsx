import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Search } from "lucide-react";
import { useSelector } from "react-redux";

export default function Header() {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useSelector((state) => state.auth);

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-gray-100">
      <div className="flex items-center justify-between px-4 py-3">
        {/* Logo */}
        <motion.h1
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: "spring", stiffness: 200, damping: 10 }}
          className="text-2xl font-extrabold text-[#002856]"
        >
          Skill<span className="text-[#edb843]">tube</span>
        </motion.h1>

        {/* Actions */}
        <div className="flex items-center gap-3">
          {isAuthenticated ? (
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={() => navigate("/profile")}
              className="w-10 h-10 bg-[#edb843] rounded-full flex items-center justify-center"
            >
              <span className="text-sm font-bold text-[#002856]">
                {user?.name?.[0]?.toUpperCase() || "U"}
              </span>
            </motion.button>
          ) : (
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate("/login")}
              className="px-4 py-2 bg-[#edb843] text-[#002856] font-semibold rounded-full text-sm"
            >
              Login
            </motion.button>
          )}
        </div>
      </div>
    </header>
  );
}
