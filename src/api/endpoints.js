import api from "./axios";

// Auth
export const sendOtp = (phoneNumber) =>
  api.post("/auth/send-otp", { phoneNumber });

export const verifyOtp = (phoneNumber, otpCode, name) =>
  api.post("/auth/verify-otp", { phoneNumber, otpCode, name });

export const loginWithPhone = (phoneNumber, name) =>
  api.post("/auth/login", { phoneNumber, name });

export const getMe = () => api.get("/auth/me");

export const searchUsers = (query) => api.get(`/auth/users/search?q=${query}`);
export const makeUserAdmin = (targetUserId) => api.post("/auth/users/make-admin", { targetUserId });

export const getDashboardStats = () => api.get("/dashboard/stats");

// Playlists
export const getPlaylists = () => api.get("/playlists");

// Admin endpoint - returns ALL playlists including inactive (for admin dropdowns)
export const getPlaylistsAdmin = () => api.get("/playlists/admin/all");

export const getPlaylistBySlug = (slug) => api.get(`/playlists/${slug}`);

export const searchPlaylists = (query) =>
  api.get(`/playlists/search?q=${query}`);

export const createPlaylist = (data) => api.post("/playlists", data);

export const updatePlaylist = (playlistId, data) =>
  api.put(`/playlists/${playlistId}`, data);

export const deletePlaylist = (playlistId) =>
  api.delete(`/playlists/${playlistId}`);

export const getPlaylistsByCategory = (categoryId) =>
  api.get(`/playlists/category/${categoryId}`);

// Categories
export const getCategories = (includeInactive = false) =>
  api.get(`/categories?includeInactive=${includeInactive}`);

export const createCategory = (data) => api.post("/categories", data);
export const updateCategory = (categoryId, data) =>
  api.put(`/categories/${categoryId}`, data);
export const deleteCategory = (categoryId) => api.delete(`/categories/${categoryId}`);
export const reorderCategories = (items) => api.put("/categories/reorder", { items });

// Featured
export const getHomeFeatured = () => api.get("/featured/home");
export const updateFeaturedSection = (sectionId, data) =>
  api.put(`/featured/${sectionId}`, data);

// Admin permissions
export const getAdminPermissions = (adminUserId) =>
  api.get(`/admin/permissions?adminUserId=${adminUserId}`);
export const grantAdminPermission = (adminUserId, permissionKey) =>
  api.post("/admin/permissions/grant", { adminUserId, permissionKey });
export const revokeAdminPermission = (adminUserId, permissionKey) =>
  api.post("/admin/permissions/revoke", { adminUserId, permissionKey });

// Videos
export const getVideosByPlaylist = (playlistId) =>
  api.get(`/videos/playlist/${playlistId}`);

export const getVideosByCategory = (categoryId, limit = 10) =>
  api.get(`/videos/category/${categoryId}?limit=${limit}`);

export const getLatestVideos = (limit = 20) =>
  api.get(`/videos/latest?limit=${limit}`);

export const searchVideos = (query) => api.get(`/videos/search?q=${query}`);

export const incrementView = (videoId) => api.post(`/videos/${videoId}/view`);

export const createVideo = (data) => api.post("/videos", data);

export const updateVideo = (videoId, data) =>
  api.put(`/videos/${videoId}`, data);

export const deleteVideo = (videoId) => api.delete(`/videos/${videoId}`);

export const getAllVideos = () => api.get("/videos");

export const getVideoById = (videoId) => api.get(`/videos/${videoId}`);

// Reactions
export const getReaction = (videoId) => api.get(`/reactions/${videoId}`);

export const likeVideo = (videoId) => api.post(`/reactions/${videoId}/like`);

export const dislikeVideo = (videoId) =>
  api.post(`/reactions/${videoId}/dislike`);

// Liked videos
export const getLikedVideos = () => api.get("/reactions/liked");

// Comments
export const getComments = (videoId) => api.get(`/comments/${videoId}`);

export const getCommentCount = (videoId) =>
  api.get(`/comments/${videoId}/count`);

export const addComment = (videoId, content) =>
  api.post(`/comments/${videoId}`, { content });

export const deleteComment = (commentId) =>
  api.delete(`/comments/${commentId}`);

// Bookmarks
export const getBookmarks = () => api.get("/bookmarks");

export const checkBookmark = (videoId) =>
  api.get(`/bookmarks/${videoId}/check`);

export const toggleBookmark = (videoId) => api.post(`/bookmarks/${videoId}`);

// Upload (direct to S3 with backend contracts)
export const initVideoUpload = (file) =>
  api.post("/upload/video/init", {
    fileName: file.name,
    contentType: file.type,
    fileSize: file.size,
  });

export const completeVideoUpload = (objectKey) =>
  api.post("/upload/video/complete", { objectKey });

export const initThumbnailUpload = (file) =>
  api.post("/upload/thumbnail/init", {
    fileName: file.name,
    contentType: file.type,
    fileSize: file.size,
  });

export const completeThumbnailUpload = (objectKey) =>
  api.post("/upload/thumbnail/complete", { objectKey });

// Notifications
export const broadcastNotification = (data) =>
  api.post("/notifications/broadcast", data);

