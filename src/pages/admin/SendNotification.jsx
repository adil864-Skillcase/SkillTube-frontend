import { useState } from "react";
import { motion } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, Send, Link as LinkIcon, Image as ImageIcon } from "lucide-react";
import toast from "react-hot-toast";

import { broadcastNotification } from "../../api/endpoints";
import { triggerHaptic } from "../../utils/haptics";

export default function SendNotification() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    body: "",
    imageUrl: "",
    deepLink: "",
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title || !formData.body) {
      triggerHaptic("heavy");
      toast.error("Title and body are required");
      return;
    }

    triggerHaptic("medium");
    if (!window.confirm("Broadcast this notification to ALL users?")) return;

    setLoading(true);
    try {
      const payload = {
        title: formData.title,
        body: formData.body,
        data: {
          url: formData.deepLink || undefined,
          image: formData.imageUrl || undefined,
        },
      };

      const res = await broadcastNotification(payload);
      toast.success(`Broadcast sent to ${res.data.sent} users!`);
      triggerHaptic("medium");
      navigate("/admin");
    } catch (err) {
      triggerHaptic("heavy");
      console.error(err);
      toast.error(err.response?.data?.error || "Failed to broadcast");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-30 pt-[env(safe-area-inset-top)]">
        <div className="flex items-center px-4 h-16">
          <Link
            to="/admin"
            className="p-2 -ml-2 mr-2 hover:bg-gray-100 rounded-full"
            onClick={() => triggerHaptic("light")}
          >
            <ArrowLeft className="w-6 h-6 text-[#002856]" />
          </Link>
          <h1 className="text-xl font-bold text-[#002856]">Send Push Notification</h1>
        </div>
      </header>

      <main className="p-4 max-w-lg mx-auto mt-4">
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-[#002856] mb-2">
                Title *
              </label>
              <input
                type="text"
                required
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 outline-none text-[#002856] focus:border-[#002856]"
                placeholder="e.g., New Playlist Available!"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[#002856] mb-2">
                Message Body *
              </label>
              <textarea
                required
                rows={3}
                value={formData.body}
                onChange={(e) => setFormData({ ...formData, body: e.target.value })}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 outline-none text-[#002856] focus:border-[#002856] resize-none"
                placeholder="Check out our new German learning course..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[#002856] mb-2">
                Deep Link URL (Optional)
              </label>
              <div className="relative">
                <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  value={formData.deepLink}
                  onChange={(e) => setFormData({ ...formData, deepLink: e.target.value })}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-10 pr-4 py-3 outline-none text-[#002856] focus:border-[#002856]"
                  placeholder="e.g., skillsnap://app/playlist/slug"
                />
              </div>
              <p className="text-xs text-gray-500 mt-2">
                Use <b>skillsnap://app/path</b> format to open a specific screen in the app when tapped.
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-[#002856] mb-2">
                Image URL (Optional)
              </label>
              <div className="relative">
                <ImageIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="url"
                  value={formData.imageUrl}
                  onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-10 pr-4 py-3 outline-none text-[#002856] focus:border-[#002856]"
                  placeholder="https://..."
                />
              </div>
            </div>

            <motion.button
              whileTap={{ scale: 0.98 }}
              disabled={loading}
              type="submit"
              className="w-full flex items-center justify-center gap-2 bg-[#edb843] text-[#002856] font-bold py-4 rounded-xl disabled:opacity-50"
            >
              <Send className="w-5 h-5" />
              {loading ? "Broadcasting..." : "Send to All Users"}
            </motion.button>
          </form>
        </div>
      </main>
    </div>
  );
}
