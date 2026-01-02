import api from "./axios";

// Auth
export const sendOtp = (phoneNumber) =>
  api.post("/auth/send-otp", { phoneNumber });

export const verifyOtp = (phoneNumber, otpCode, name) =>
  api.post("/auth/verify-otp", { phoneNumber, otpCode, name });

export const loginWithPhone = (phoneNumber, name) =>
  api.post("/auth/login", { phoneNumber, name });

export const getMe = () => api.get("/auth/me");

// Playlists
export const getPlaylists = () => api.get("/playlists");

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

// Upload
export const uploadVideo = (file, onProgress) => {
  const formData = new FormData();
  formData.append("video", file);
  return api.post("/upload/video", formData, {
    headers: { "Content-Type": "multipart/form-data" },
    onUploadProgress: (e) =>
      onProgress?.(Math.round((e.loaded * 100) / e.total)),
  });
};

export const uploadThumbnail = (file) => {
  const formData = new FormData();
  formData.append("thumbnail", file);
  return api.post("/upload/thumbnail", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
};
