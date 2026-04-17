import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Search, UserCheck } from "lucide-react";
import { useSelector } from "react-redux";
import toast from "react-hot-toast";
import {
  getAdminPermissions,
  grantAdminPermission,
  revokeAdminPermission,
  searchUsers,
  makeUserAdmin
} from "../../api/endpoints";
import { PERMISSIONS, hasPermission } from "../../utils/permissions";

export default function AdminPermissions() {
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  
  // Search state
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);
  
  // Selected admin user state
  const [selectedUser, setSelectedUser] = useState(null);
  const [permissions, setPermissions] = useState([]);
  const [available, setAvailable] = useState([]);
  const [loading, setLoading] = useState(false);

  if (!hasPermission(user, PERMISSIONS.ADMIN_MANAGE_PERMISSIONS)) {
    navigate("/admin");
    return null;
  }

  // Debounced user search
  useEffect(() => {
    const timer = setTimeout(async () => {
      if (!searchQuery.trim()) {
        setSearchResults([]);
        return;
      }
      setSearching(true);
      try {
        const res = await searchUsers(searchQuery);
        setSearchResults(res.data || []);
      } catch (err) {
        // fail silently for search
      } finally {
        setSearching(false);
      }
    }, 400);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const loadPermissions = async (userId) => {
    setLoading(true);
    try {
      const res = await getAdminPermissions(userId);
      setPermissions(res.data.permissions || []);
      setAvailable(res.data.availablePermissions || []);
    } catch (err) {
      toast.error(err.response?.data?.error || "Failed to fetch permissions");
      setSelectedUser(null);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectUser = async (targetUser) => {
    setSearchQuery("");
    setSearchResults([]);
    setSelectedUser(targetUser);

    if (targetUser.role !== "admin" && targetUser.role !== "super_admin") {
      try {
        await makeUserAdmin(targetUser.user_id);
        toast. सफलता("User promoted to Admin successfully");
        // Update local object explicitly
        targetUser.role = 'admin'; 
        setSelectedUser({...targetUser});
      } catch (err) {
        toast.error("Failed to promote user to Admin");
        setSelectedUser(null);
        return;
      }
    }
    
    await loadPermissions(targetUser.user_id);
  };

  const togglePermission = async (permissionKey) => {
    if (!selectedUser) return;
    try {
      if (permissions.includes(permissionKey)) {
        await revokeAdminPermission(selectedUser.user_id, permissionKey);
      } else {
        await grantAdminPermission(selectedUser.user_id, permissionKey);
      }
      loadPermissions(selectedUser.user_id);
    } catch (err) {
      toast.error("Failed to update permission");
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
          <button
            onClick={() => navigate("/admin")}
            className="p-2 hover:bg-gray-100 rounded-full"
          >
            <ArrowLeft className="w-5 h-5 text-[#002856]" />
          </button>
          <h1 className="text-xl font-bold text-[#002856]">Admin Permissions</h1>
        </div>
      </header>

      <div className="p-4 space-y-4">
        {/* Search Input */}
        <div className="relative z-20">
          <label className="block text-sm font-semibold text-[#002856] mb-1.5">Search User</label>
          <div className="flex items-center px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus-within:border-[#edb843] focus-within:ring-1 focus-within:ring-[#edb843]">
            <Search className="w-5 h-5 text-gray-400 mr-2 shrink-0" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by name or phone..."
              className="w-full bg-transparent outline-none text-[#002856]"
            />
            {searching && <div className="w-4 h-4 border-2 border-[#edb843] border-t-transparent rounded-full animate-spin shrink-0" />}
          </div>

          {/* Autocomplete Dropdown */}
          <AnimatePresence>
            {searchQuery.trim() && searchResults.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="absolute left-0 right-0 mt-2 bg-white rounded-xl shadow-lg border border-gray-100 max-h-60 overflow-y-auto"
              >
                {searchResults.map((u) => (
                  <button
                    key={u.user_id}
                    onClick={() => handleSelectUser(u)}
                    className="w-full text-left px-4 py-3 hover:bg-gray-50 flex flex-col gap-0.5 border-b border-gray-50 last:border-0"
                  >
                    <div className="flex justify-between items-center w-full">
                       <p className="font-semibold text-sm text-[#002856]">{u.name}</p>
                       {u.role === 'admin' || u.role === 'super_admin' ? (
                          <span className="text-[10px] bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-bold">ADMIN</span>
                       ) : null}
                    </div>
                    <p className="text-xs text-gray-400">{u.phone_number}</p>
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Selected User Header */}
        {selectedUser && (
          <div className="p-4 bg-[#002856]/5 border border-[#002856]/10 rounded-2xl flex items-center gap-4">
             <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shrink-0 shadow-sm">
                <UserCheck className="w-6 h-6 text-[#edb843]" />
             </div>
             <div>
               <p className="font-bold text-[#002856] text-lg leading-tight">{selectedUser.name}</p>
               <p className="text-sm text-gray-500">{selectedUser.phone_number}</p>
             </div>
          </div>
        )}
      </div>

      {loading ? (
        <div className="p-10 flex justify-center">
            <div className="w-8 h-8 border-2 border-[#edb843] border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        selectedUser && (
          <div className="px-4 pb-20 space-y-2">
            <h3 className="text-sm font-semibold text-gray-500 mb-3 px-1 uppercase tracking-wider">Access Controls</h3>
            {available.map((key) => {
              const isGranted = permissions.includes(key);
              return (
                <button
                  key={key}
                  onClick={() => togglePermission(key)}
                  className={`w-full flex items-center justify-between px-4 py-3.5 rounded-xl border transition-all ${
                    isGranted
                      ? "bg-[#edb843]/10 border-[#edb843]/30"
                      : "bg-white border-gray-200 hover:bg-gray-50"
                  }`}
                >
                  <span className={`font-medium ${isGranted ? "text-[#002856]" : "text-gray-600"}`}>
                    {key.replace(/_/g, " ")}
                  </span>
                  
                  {/* Visual Toggle Switch */}
                  <div className={`w-11 h-6 rounded-full p-1 transition-colors ${isGranted ? "bg-[#edb843]" : "bg-gray-200"}`}>
                    <div className={`w-4 h-4 bg-white rounded-full transition-transform ${isGranted ? "translate-x-5" : "translate-x-0"}`} />
                  </div>
                </button>
              );
            })}
          </div>
        )
      )}
    </motion.div>
  );
}
