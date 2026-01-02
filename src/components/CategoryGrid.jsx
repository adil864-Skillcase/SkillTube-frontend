import { motion } from "framer-motion";
import { CATEGORIES } from "../constants/categories.js";

export default function CategoryGrid({ onSelect }) {
  return (
    <div className="grid grid-cols-4 gap-3">
      {CATEGORIES.map((cat, index) => (
        <motion.button
          key={cat.id}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{
            delay: index * 0.02,
            type: "spring",
            stiffness: 200,
            damping: 15,
          }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => onSelect?.(cat)}
          className="flex flex-col items-center gap-1 p-2"
        >
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center"
            style={{ backgroundColor: `${cat.color}15` }}
          >
            <cat.Icon className="w-5 h-5" style={{ color: cat.color }} />
          </div>
          <span className="text-[10px] text-[#002856] text-center font-medium">
            {cat.name}
          </span>
        </motion.button>
      ))}
    </div>
  );
}
