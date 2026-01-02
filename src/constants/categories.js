import {
  Stamp,
  Languages,
  Briefcase,
  Home,
  GraduationCap,
  Flag,
  Plane,
  UtensilsCrossed,
} from "lucide-react";

export const CATEGORIES = [
  { id: "visa", name: "Visa Process", Icon: Stamp, color: "#3b82f6" },

  {
    id: "language",
    name: "German Language",
    Icon: Languages,
    color: "#8b5cf6",
  },

  { id: "jobs", name: "Jobs & Career", Icon: Briefcase, color: "#10b981" },

  { id: "living", name: "Cost of Living", Icon: Home, color: "#f59e0b" },

  { id: "education", name: "Education", Icon: GraduationCap, color: "#ec4899" },

  { id: "culture", name: "German Culture", Icon: Flag, color: "#ef4444" },

  { id: "travel", name: "Travel Tips", Icon: Plane, color: "#06b6d4" },

  {
    id: "food",
    name: "Food & Cuisine",
    Icon: UtensilsCrossed,
    color: "#84cc16",
  },
];

export const getCategoryById = (id) => CATEGORIES.find((c) => c.id === id);
