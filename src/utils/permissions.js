export const PERMISSIONS = {
  VIDEO_CREATE: "video.create",
  VIDEO_EDIT: "video.edit",
  VIDEO_DELETE: "video.delete",
  PLAYLIST_MANAGE: "playlist.manage",
  CATEGORY_MANAGE: "category.manage",
  FEATURED_MANAGE: "featured.manage",
  ADMIN_MANAGE_PERMISSIONS: "admin.manage_permissions",
};

export const hasPermission = (user, permissionKey) => {
  if (!user) return false;
  if (user.role === "super_admin") return true;
  const list = Array.isArray(user.permissions) ? user.permissions : [];
  return list.includes(permissionKey);
};
