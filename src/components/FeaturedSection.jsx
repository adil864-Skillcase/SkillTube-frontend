import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Play, TrendingUp } from "lucide-react";
import { playSound } from "../utils/sounds";

export default function FeaturedSection({ section }) {
  const navigate = useNavigate();
  const items = section?.items || [];

  if (!items.length) return null;

  return (
    <section className="pt-4 pb-2">
      <div className="w-full px-4 mb-2 flex items-center gap-2.5">
        <h2 className="text-neutral-900 text-base font-semibold font-['Poppins'] leading-6">
          Trending
        </h2>
      </div>
      <div className="pl-4 pr-4 pb-2 flex gap-2 overflow-x-auto hide-scrollbar snap-x snap-mandatory">
        {items.map((video, idx) => (
          <motion.button
            key={video.video_id}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: idx * 0.04 }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => {
              playSound("tap");
              navigate(`/player/${video.playlist_slug}?v=${video.video_id}`);
            }}
            className="shrink-0 w-28 aspect-9/16 relative rounded-2xl overflow-hidden group snap-start"
          >
            {/* Background Thumbnail */}
            {video.thumbnail_url ? (
              <img
                src={video.thumbnail_url}
                alt={video.title}
                className="w-full h-full object-cover"
                loading="lazy"
              />
            ) : (
              <div className="w-full h-full bg-linear-to-br from-[#002856] to-[#003d83]" />
            )}

            {/* Subtle Gradient for title visibility if needed, or play button */}
            <div className="absolute inset-0 bg-linear-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-2">
              <div className="mx-auto mb-auto mt-auto w-8 h-8 bg-white/20 backdrop-blur rounded-full flex items-center justify-center">
                <Play className="w-4 h-4 text-white fill-white" />
              </div>
            </div>
          </motion.button>
        ))}
      </div>
    </section>
  );
}
