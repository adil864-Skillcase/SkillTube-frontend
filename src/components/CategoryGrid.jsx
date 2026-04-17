import { motion } from "framer-motion";
import * as Icons from "lucide-react";
import { playSound } from "../utils/sounds";

export default function CategoryGrid({ categories = [], onSelect }) {
  // User wants old UI design but preserving dynamic categories mapping
  return (
    <div className="grid grid-cols-4 gap-3">
      {categories.map((cat, index) => {
        const IconComponent = cat.Icon || Icons[cat.icon_name] || Icons.Box;

        return (
          <motion.button
            key={cat.id || cat.slug}
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
            onClick={() => {
              playSound("tap");
              onSelect?.(cat);
            }}
            className="flex flex-col items-center gap-1 p-2"
          >
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center bg-slate-100"
            >
              {IconComponent && (
                <IconComponent className="w-5 h-5 text-[#002856]" />
              )}
            </div>
            <span className="text-[10px] text-[#002856] text-center font-medium line-clamp-2">
              {cat.name}
            </span>
          </motion.button>
        );
      })}
    </div>
  );
}
