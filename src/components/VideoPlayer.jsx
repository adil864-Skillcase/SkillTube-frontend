import { useRef, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { motion } from "framer-motion";
import toast from "react-hot-toast";

import {
  ThumbsUp,
  ThumbsDown,
  MessageCircle,
  Share2,
  Bookmark,
  Volume2,
  VolumeX,
} from "lucide-react";

import {
  getReaction,
  likeVideo,
  dislikeVideo,
  checkBookmark,
  toggleBookmark,
  getCommentCount,
} from "../api/endpoints";

import DoubleTapLike from "./DoubleTapLike";
import { playSound } from "../utils/sounds";

export default function VideoPlayer({ video, isActive, playlist, onOpenComments, onCommentCountChange, commentCount = 0 }) {
  const navigate = useNavigate();

  const videoRef = useRef(null);

  const { isAuthenticated } = useSelector((state) => state.auth);

  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [progress, setProgress] = useState(0);

  // Engagement state
  const [reaction, setReaction] = useState(null);
  const [likeCount, setLikeCount] = useState(video.like_count || 0);
  const [dislikeCount, setDislikeCount] = useState(video.dislike_count || 0);
  const [isBookmarked, setIsBookmarked] = useState(false);

  useEffect(() => {
    if (isActive) {
      videoRef.current?.play().catch(() => {});

      setIsPlaying(true);
      fetchEngagement();
    } else {
      videoRef.current?.pause();
      setIsPlaying(false);
    }
  }, [isActive]);

  const fetchEngagement = async () => {
    try {
      const [reactionRes, bookmarkRes, commentsRes] = await Promise.all([
        getReaction(video.video_id),
        checkBookmark(video.video_id),
        getCommentCount(video.video_id),
      ]);

      setReaction(reactionRes.data.reaction);
      setIsBookmarked(bookmarkRes.data.bookmarked);
      onCommentCountChange?.(commentsRes.data.count);
    } catch (err) {}
  };

  const requireAuth = (action) => {
    if (!isAuthenticated) {
      toast.error("Please login first");
      navigate("/login");
      return false;
    }
    return true;
  };

  const handleLike = async () => {
    playSound("like");
    if (!requireAuth()) return;

    // Optimistic update
    const wasLiked = reaction === "like";
    const wasDisliked = reaction === "dislike";
    setReaction(wasLiked ? null : "like");
    setLikeCount((prev) => (wasLiked ? prev - 1 : prev + 1));
    if (wasDisliked) setDislikeCount((prev) => prev - 1);

    try {
      const res = await likeVideo(video.video_id);
      // Confirm with server state
      setReaction(res.data.reaction);
    } catch (err) {
      // Revert on failure
      toast.error("Failed");
      setReaction(reaction);
      setLikeCount((prev) => (wasLiked ? prev + 1 : prev - 1));
      if (wasDisliked) setDislikeCount((prev) => prev + 1);
    }
  };

  const handleDislike = async () => {
    if (!requireAuth()) return;

    // Optimistic update
    const wasLiked = reaction === "like";
    const wasDisliked = reaction === "dislike";
    setReaction(wasDisliked ? null : "dislike");
    setDislikeCount((prev) => (wasDisliked ? prev - 1 : prev + 1));
    if (wasLiked) setLikeCount((prev) => prev - 1);

    try {
      const res = await dislikeVideo(video.video_id);
      // Confirm with server state
      setReaction(res.data.reaction);
    } catch (err) {
      // Revert on failure
      toast.error("Failed");
      setReaction(reaction);
      setDislikeCount((prev) => (wasDisliked ? prev + 1 : prev - 1));
      if (wasLiked) setLikeCount((prev) => prev + 1);
    }
  };

  const handleBookmark = async () => {
    playSound("like");
    if (!requireAuth()) return;

    // Optimistic update
    const wasBookmarked = isBookmarked;
    setIsBookmarked(!wasBookmarked);
    toast.success(!wasBookmarked ? "Saved!" : "Removed");

    try {
      const res = await toggleBookmark(video.video_id);
      setIsBookmarked(res.data.bookmarked);
    } catch (err) {
      toast.error("Failed");
      setIsBookmarked(wasBookmarked);
    }
  };

  const handleShare = async () => {
    const url = `${window.location.origin}/player/${
      playlist?.slug || "video"
    }?v=${video.video_id}`;

    if (navigator.share) {
      try {
        await navigator.share({ title: video.title, url });
      } catch (err) {
        if (err.name !== "AbortError") copyLink(url);
      }
    } else {
      copyLink(url);
    }
  };

  const copyLink = (url) => {
    navigator.clipboard.writeText(url);
    toast.success("Link copied!");
  };

  const togglePlay = () => {
    if (isPlaying) {
      videoRef.current?.pause();
      setIsPlaying(false);
    } else {
      videoRef.current?.play();
      setIsPlaying(true);
    }
  };

  const formatCount = (n) => {
    if (n >= 1000000) return (n / 1000000).toFixed(1) + "M";
    if (n >= 1000) return (n / 1000).toFixed(1) + "K";
    return n.toString();
  };

  return (
    <DoubleTapLike
      onDoubleTap={() => {
        if (!isAuthenticated) {
          toast.error("Please login first");
          navigate("/login");
          return;
        }
        handleLike();
      }}
      isLiked={reaction === "like"}
    >
      <div className="relative w-full h-full bg-black" onClick={togglePlay}>
        <video
          ref={videoRef}
          src={video.video_url}
          poster={video.thumbnail_url}
          className="w-full h-full object-cover"
          loop
          muted={isMuted}
          playsInline
          onTimeUpdate={() => {
            if (videoRef.current) {
              setProgress(
                (videoRef.current.currentTime / videoRef.current.duration) * 100
              );
            }
          }}
        />

        {/* Play Button Overlay */}
        {!isPlaying && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/10">
            <div className="w-16 h-16 bg-black/40 rounded-full flex items-center justify-center backdrop-blur-sm">
               <svg className="w-8 h-8 text-white fill-current ml-1" viewBox="0 0 24 24">
                 <path d="M8 5v14l11-7z" />
               </svg>
            </div>
          </div>
        )}

        {/* Gradient */}
        <div className="absolute inset-0 gradient-bottom pointer-events-none" />

        {/* Logo - Removed as requested to remove header icon */}

        {/* Right action buttons */}
        <div className="absolute right-3 top-1/2 -translate-y-1/2 flex flex-col items-center gap-2">
          {/* Like */}
          <ActionButton
            icon={ThumbsUp}
            count={formatCount(likeCount)}
            active={reaction === "like"}
            activeColor="text-accent"
            onClick={handleLike}
          />

          {/* Dislike */}
          <ActionButton
            icon={ThumbsDown}
            active={reaction === "dislike"}
            activeColor="text-red-500"
            onClick={handleDislike}
          />

          {/* Comments */}
          <ActionButton
            icon={MessageCircle}
            count={formatCount(commentCount)}
            onClick={(e) => {
              e.stopPropagation();
              onOpenComments?.();
            }}
          />

          {/* Share */}
          <ActionButton icon={Share2} onClick={handleShare} />

          {/* Bookmark */}
          <ActionButton
            icon={Bookmark}
            active={isBookmarked}
            activeColor="text-accent"
            filled={isBookmarked}
            onClick={handleBookmark}
          />

          {/* Mute */}
          <ActionButton
            icon={isMuted ? VolumeX : Volume2}
            onClick={(e) => {
              e.stopPropagation();
              setIsMuted(!isMuted);
            }}
          />
        </div>

        {/* Video info */}
        <div className="absolute bottom-20 left-4 right-16 pointer-events-none">
          <h3 className="text-lg font-bold text-white leading-tight drop-shadow-md line-clamp-2">
            {video.title}
          </h3>
        </div>

        {/* Progress bar */}
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-gray-800">
          <motion.div
            className="h-full bg-accent"
            style={{ width: `${progress}%` }}
          />
        </div>

      </div>
    </DoubleTapLike>
  );
}

function ActionButton({
  icon: Icon,
  count,
  active,
  activeColor,
  filled,
  onClick,
}) {
  return (
    <motion.button
      whileTap={{ scale: 0.85 }}
      animate={active ? { scale: [1, 1.2, 1] } : {}}
      transition={{ duration: 0.2 }}
      onClick={(e) => {
        e.stopPropagation();
        onClick?.(e);
      }}
      className="flex flex-col items-center gap-0.5 h-14 justify-start"
    >
      <div
        className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
          active ? "bg-white/20" : "bg-black/40"
        }`}
      >
        <Icon
          className={`w-5 h-5 ${active ? activeColor : "text-white"} ${
            filled ? "fill-current" : ""
          }`}
        />
      </div>
      {count && <span className="text-[10px] text-white/90">{count}</span>}
    </motion.button>
  );
}
