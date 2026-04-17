import { getCategoryIcon } from "./categoryIcons";

export const normalizeCategory = (category) => {
  if (!category) return null;
  return {
    id: category.category_id,
    slug: category.slug,
    name: category.name,
    color: category.color,
    iconKey: category.icon_key,
    is_active: category.is_active,
    playlist_count: category.playlist_count ?? 0,
    Icon: getCategoryIcon(category.icon_key),
  };
};

export const normalizeCategories = (categories = []) => {
  return categories.map(normalizeCategory).filter(Boolean);
};

export const findCategoryBySlug = (categories = [], slug) => {
  return categories.find((item) => item.slug === slug) || null;
};

export const findCategoryByAny = (categories = [], value) => {
  if (!value) return null;
  const valInfo = String(value).toLowerCase().trim();
  return (
    categories.find(
      (item) =>
        (item.slug && item.slug.toLowerCase() === valInfo) ||
        String(item.id) === valInfo ||
        (item.name && item.name.toLowerCase() === valInfo)
    ) || null
  );
};
