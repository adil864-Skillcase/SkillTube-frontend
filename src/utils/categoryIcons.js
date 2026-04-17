import {
  Stamp,
  Languages,
  Briefcase,
  Home,
  GraduationCap,
  Flag,
  Plane,
  UtensilsCrossed,
  PlaySquare,
  Music2,
  Clapperboard,
  BookOpen,
  MonitorPlay,
  HeartPulse,
  Dumbbell,
  Landmark,
  PiggyBank,
  Coffee,
  Code,
  Palette,
  Camera,
  Shirt,
  Sprout,
  Trophy,
} from "lucide-react";

export const CATEGORY_ICON_MAP = {
  Stamp,
  Languages,
  Briefcase,
  Home,
  GraduationCap,
  Flag,
  Plane,
  UtensilsCrossed,
  PlaySquare,
  Music2,
  Clapperboard,
  BookOpen,
  MonitorPlay,
  HeartPulse,
  Dumbbell,
  Landmark,
  PiggyBank,
  Coffee,
  Code,
  Palette,
  Camera,
  Shirt,
  Sprout,
  Trophy,
};

export const CATEGORY_ICON_OPTIONS = Object.keys(CATEGORY_ICON_MAP);

export const getCategoryIcon = (iconKey) => {
  return CATEGORY_ICON_MAP[iconKey] || PlaySquare;
};
