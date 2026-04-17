import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Plus, ChevronUp, ChevronDown, Pencil } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import toast from "react-hot-toast";
import {
  reorderCategories,
} from "../../api/endpoints";
import { fetchCategories } from "../../redux/slices/categorySlice";
import { getCategoryIcon } from "../../utils/categoryIcons";
import { normalizeCategories } from "../../utils/categoryHelpers";
import { PERMISSIONS, hasPermission } from "../../utils/permissions";

export default function ManageCategories() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { items } = useSelector((state) => state.categories);
  const categories = normalizeCategories(items);

  useEffect(() => {
    if (!hasPermission(user, PERMISSIONS.CATEGORY_MANAGE)) {
      navigate("/admin");
      return;
    }
    dispatch(fetchCategories(true));
  }, [dispatch, navigate, user]);

  const refresh = () => dispatch(fetchCategories(true));

  const moveCategory = async (e, index, direction) => {
    e.stopPropagation();
    const target = index + direction;
    if (target < 0 || target >= categories.length) return;

    const reordered = [...categories];
    [reordered[index], reordered[target]] = [reordered[target], reordered[index]];

    try {
      await reorderCategories(
        reordered.map((item, idx) => ({
          categoryId: item.id,
          displayOrder: idx,
        }))
      );
      refresh();
    } catch (err) {
      toast.error("Failed to reorder categories");
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
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center gap-4">
            <button onClick={() => navigate("/admin")} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
              <ArrowLeft className="w-5 h-5 text-[#002856]" />
            </button>
            <h1 className="text-xl font-bold text-[#002856]">Categories</h1>
          </div>
          <button
             onClick={() => navigate("/admin/categories/create")}
             className="flex items-center gap-2 px-4 py-2 bg-[#edb843] text-[#002856] font-medium rounded-xl hover:bg-[#dca332] transition-colors"
          >
             <Plus className="w-4 h-4" />
             New
          </button>
        </div>
      </header>

      <div className="p-4 space-y-3 pb-20">
        {categories.map((category, index) => {
          const Icon = getCategoryIcon(category.iconKey);
          return (
            <div
              key={category.id}
              onClick={() => navigate(`/admin/categories/edit/${category.id}`)}
              className="flex items-center gap-3 p-3 bg-gray-50 border border-gray-100 rounded-xl hover:bg-gray-100/70 cursor-pointer transition-colors"
            >
              <div 
                className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0 shadow-sm" 
                style={{ backgroundColor: "#002856" }}
              >
                <Icon className="w-5 h-5 text-[#edb843]" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-bold text-[#002856] truncate flex items-center gap-2">
                   {category.name}
                   {!category.is_active && (
                       <span className="px-2 py-0.5 rounded-md bg-gray-200 text-gray-500 text-[10px] font-bold uppercase">Hidden</span>
                   )}
                </p>
                <p className="text-xs text-gray-500 font-medium">
                  {category.playlist_count || 0} playlists attached
                </p>
              </div>
              <div className="flex shrink-0 items-center justify-end gap-1">
                <button onClick={(e) => moveCategory(e, index, -1)} className="p-2 hover:bg-gray-200 rounded-lg transition-colors">
                  <ChevronUp className="w-4 h-4 text-gray-500" />
                </button>
                <button onClick={(e) => moveCategory(e, index, 1)} className="p-2 hover:bg-gray-200 rounded-lg transition-colors">
                  <ChevronDown className="w-4 h-4 text-gray-500" />
                </button>
                <div className="w-px h-6 bg-gray-200 mx-1"></div>
                <button className="p-2 text-gray-400 hover:text-[#002856] transition-colors">
                  <Pencil className="w-4 h-4" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </motion.div>
  );
}
