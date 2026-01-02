import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Heart, Sparkles } from "lucide-react";

export default function DoubleTapLike({ onDoubleTap, children, isLiked }) {
  const [showCelebration, setShowCelebration] = useState(false);
  const [lastTap, setLastTap] = useState(0);

  const handleTap = (e) => {
    const now = Date.now();
    const DOUBLE_TAP_DELAY = 300;

    if (now - lastTap < DOUBLE_TAP_DELAY) {
      // Double tap detected
      e.stopPropagation();
      onDoubleTap?.();
      triggerCelebration();
    }
    setLastTap(now);
  };

  const triggerCelebration = () => {
    setShowCelebration(true);
    setTimeout(() => setShowCelebration(false), 1000);
  };

  return (
    <div onClick={handleTap} className="relative w-full h-full">
      {children}
      {/* Celebration animation */}
      <AnimatePresence>
        {showCelebration && (
          <motion.div
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0 }}
            className="absolute inset-0 flex items-center justify-center pointer-events-none z-50"
          >
            {/* Heart burst */}
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: [0, 1.5, 1] }}
              transition={{ duration: 0.6, times: [0, 0.6, 1] }}
            >
              <Heart className="w-24 h-24 text-[#edb843] fill-[#edb843] drop-shadow-lg" />
            </motion.div>

            {/* Sparkles */}
            {[...Array(8)].map((_, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 1, scale: 0, x: 0, y: 0 }}
                animate={{
                  opacity: 0,
                  scale: 1,
                  x: Math.cos((i * Math.PI) / 4) * 80,
                  y: Math.sin((i * Math.PI) / 4) * 80,
                }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className="absolute"
              >
                <Sparkles className="w-6 h-6 text-[#edb843]" />
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
