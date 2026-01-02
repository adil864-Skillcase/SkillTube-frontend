import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Send } from "lucide-react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

import { getComments, addComment } from "../api/endpoints";

import { playSound } from "../utils/sounds";

//Skeletons
import CommentSkeleton from "./skeletons/CommentSkeleton";

export default function CommentsSheet({
  show,
  videoId,
  onClose,
  onCountChange,
}) {
  const navigate = useNavigate();

  const { isAuthenticated, user } = useSelector((state) => state.auth);

  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [loading, setLoading] = useState(false);
  const [fetchingComments, setFetchingComments] = useState(false);

  useEffect(() => {
    if (show && videoId) fetchComments();
  }, [show, videoId]);

  const fetchComments = async () => {
    setFetchingComments(true);
    try {
      const res = await getComments(videoId);
      setComments(res.data);
    } catch (err) {
    } finally {
      setFetchingComments(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      toast.error("Please login first");
      navigate("/login");
      return;
    }
    if (!newComment.trim()) return;

    setLoading(true);
    try {
      const res = await addComment(videoId, newComment);
      setComments([{ ...res.data, name: user?.name }, ...comments]);
      setNewComment("");
      onCountChange?.(comments.length + 1);
      toast.success("Comment added!");
      playSound("success");
    } catch (err) {
      toast.error("Failed to add comment");
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (date) => {
    const d = new Date(date);
    const now = new Date();
    const diff = Math.floor((now - d) / 1000);
    if (diff < 60) return "Just now";
    if (diff < 3600) return `${Math.floor(diff / 60)}m`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h`;
    return `${Math.floor(diff / 86400)}d`;
  };

  return (
    <AnimatePresence>
      {show && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/60 z-40"
          />

          {/* Sheet - Light theme */}
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 25 }}
            className="absolute bottom-0 left-0 right-0 h-[60vh] bg-white rounded-t-3xl z-50"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <h3 className="text-lg font-bold text-[#002856]">
                Comments ({comments.length})
              </h3>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 rounded-full"
              >
                <X className="w-5 h-5 text-[#002856]" />
              </button>
            </div>

            {/* Comments list */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 h-[calc(60vh-130px)]">
              {fetchingComments ? (
                <>
                  <CommentSkeleton />
                  <CommentSkeleton />
                  <CommentSkeleton />
                </>
              ) : comments.length === 0 ? (
                <p className="text-gray-500 text-center py-8">
                  No comments yet. Be the first!
                </p>
              ) : (
                comments.map((comment) => (
                  <div key={comment.comment_id} className="flex gap-3">
                    <div className="w-8 h-8 bg-[#edb843] rounded-full flex items-center justify-center shrink-0">
                      <span className="text-sm font-bold text-[#002856]">
                        {comment.name?.[0]?.toUpperCase() || "U"}
                      </span>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-[#002856]">
                          {comment.name || "User"}
                        </span>
                        <span className="text-xs text-gray-400">
                          {formatTime(comment.created_at)}
                        </span>
                      </div>
                      <p className="text-sm text-gray-700 mt-1">
                        {comment.content}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Input */}
            <form
              onSubmit={handleSubmit}
              className="p-4 border-t border-gray-200 flex gap-3"
            >
              <input
                type="text"
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Add a comment..."
                className="flex-1 bg-gray-100 rounded-full px-4 py-2 text-sm outline-none text-[#002856] placeholder:text-gray-400"
              />
              <motion.button
                whileTap={{ scale: 0.9 }}
                type="submit"
                disabled={loading || !newComment.trim()}
                className="w-10 h-10 bg-[#edb843] rounded-full flex items-center justify-center disabled:opacity-50"
              >
                <Send className="w-5 h-5 text-[#002856]" />
              </motion.button>
            </form>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
