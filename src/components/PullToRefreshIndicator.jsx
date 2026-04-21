import { motion, AnimatePresence } from "framer-motion";

/**
 * Visual indicator rendered above the page content during pull-to-refresh.
 *
 * @param {number}  pullProgress  - 0 to 1 (1 = threshold reached)
 * @param {boolean} isRefreshing  - true while the refresh Promise is in-flight
 */
export default function PullToRefreshIndicator({ pullProgress, isRefreshing }) {
  const radius = 10;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - pullProgress * circumference;

  return (
    <AnimatePresence>
      {(pullProgress > 0 || isRefreshing) && (
        <motion.div
          key="ptr-indicator"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.15 }}
          className="absolute top-0 left-0 right-0 flex justify-center"
          style={{ zIndex: 40, pointerEvents: "none" }}
        >
          <div className="mt-3 w-10 h-10 rounded-full bg-white shadow-md flex items-center justify-center">
            {isRefreshing ? (
              // Spinning circle while loading
              <svg
                className="w-5 h-5 animate-spin text-[#002856]"
                viewBox="0 0 24 24"
                fill="none"
              >
                <circle
                  cx="12" cy="12" r="10"
                  stroke="currentColor"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeDasharray="31.4"
                  strokeDashoffset="10"
                />
              </svg>
            ) : (
              // Arc filling up as user pulls
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                {/* Track */}
                <circle
                  cx="12" cy="12" r={radius}
                  stroke="#e5e7eb"
                  strokeWidth="2.5"
                  fill="none"
                />
                {/* Progress arc */}
                <circle
                  cx="12" cy="12" r={radius}
                  stroke="#002856"
                  strokeWidth="2.5"
                  fill="none"
                  strokeLinecap="round"
                  strokeDasharray={circumference}
                  strokeDashoffset={strokeDashoffset}
                  transform="rotate(-90 12 12)"
                  style={{ transition: "stroke-dashoffset 0.05s linear" }}
                />
                {/* Down arrow icon in center */}
                <path
                  d="M12 8v8M9 13l3 3 3-3"
                  stroke={pullProgress >= 1 ? "#edb843" : "#002856"}
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  style={{ transition: "stroke 0.2s" }}
                />
              </svg>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
