import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Save } from "lucide-react";
import toast from "react-hot-toast";

import { createCategory } from "../../api/endpoints";
import { getCategoryIcon, CATEGORY_ICON_OPTIONS } from "../../utils/categoryIcons";
import { triggerHaptic, triggerNotificationHaptic } from "../../utils/haptics";

export default function CreateCategory() {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [iconKey, setIconKey] = useState(CATEGORY_ICON_OPTIONS[0]);
  const [saving, setSaving] = useState(false);

  const handleCreate = async () => {
    if (!name.trim()) {
      toast.error("Category name is required");
      triggerNotificationHaptic("error");
      return;
    }
    setSaving(true);
    try {
      await createCategory({ name, iconKey, color: "#edb843" });
      toast.success("Category created");
      triggerNotificationHaptic("success");
      navigate("/admin/categories");
    } catch (err) {
      toast.error(err.response?.data?.error || "Failed to create category");
      triggerNotificationHaptic("error");
    } finally {
      setSaving(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen bg-white"
    >
      <header className="sticky top-0 z-10 bg-white border-b border-gray-200">
        <div className="flex items-center gap-4 p-4">
          <button onClick={() => navigate("/admin/categories")} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
            <ArrowLeft className="w-5 h-5 text-[#002856]" />
          </button>
          <h1 className="text-xl font-bold text-[#002856]">Create Category</h1>
        </div>
      </header>

      <div className="p-4 space-y-6 max-w-4xl mx-auto pt-6">
        <div>
          <label className="block text-[#002856] text-sm font-medium mb-2">Category Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Technology"
            className="w-full px-4 py-3 border border-gray-200 rounded-xl outline-none focus:border-[#edb843] bg-gray-50 text-[#002856]"
          />
        </div>
        
        <div>
          <label className="block text-[#002856] text-sm font-medium mb-3">Select Icon</label>
          <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-3 bg-gray-50 p-4 rounded-xl border border-gray-100">
            {CATEGORY_ICON_OPTIONS.map((key) => {
              const Icon = getCategoryIcon(key);
              const isSelected = iconKey === key;
              return (
                <button
                  key={key}
                  onClick={() => {
                    triggerHaptic("light");
                    setIconKey(key);
                  }}
                  className={`aspect-square rounded-xl flex flex-col items-center justify-center gap-1 transition-all ${
                    isSelected 
                      ? "bg-[#edb843] text-[#002856] shadow-sm transform scale-105 border border-[#edb843]" 
                      : "bg-white text-gray-500 hover:bg-gray-100 border border-gray-200 hover:text-[#002856]"
                  }`}
                  title={key}
                >
                  <Icon className="w-6 h-6" />
                </button>
              );
            })}
          </div>
        </div>

        <motion.button
          whileTap={{ scale: 0.98 }}
          disabled={saving}
          onClick={handleCreate}
          className="w-full mt-6 flex items-center justify-center gap-2 px-4 py-4 bg-[#002856] hover:bg-[#003d83] text-white rounded-xl font-bold transition-colors disabled:opacity-50"
        >
          {saving ? "Creating..." : (
            <>
              <Save className="w-5 h-5 text-[#edb843]" />
              Create Category
            </>
          )}
        </motion.button>
      </div>
    </motion.div>
  );
}
