import { Capacitor } from "@capacitor/core";
import { Haptics, ImpactStyle, NotificationType } from "@capacitor/haptics";

const isNative = Capacitor.isNativePlatform();

const STYLE_MAP = {
  light: ImpactStyle.Light,
  medium: ImpactStyle.Medium,
  heavy: ImpactStyle.Heavy,
};

/**
 * Single haptic impact.
 * @param {'light' | 'medium' | 'heavy'} style
 */
export const triggerHaptic = async (style = "light") => {
  if (!isNative) return;
  try {
    await Haptics.impact({ style: STYLE_MAP[style] ?? ImpactStyle.Light });
  } catch (error) {
    console.error("[Haptics] Failed:", error?.message ?? error);
  }
};

/**
 * Plays a sequence of haptic impacts with delays between them.
 * Enables ramp-up, ramp-down, double-bump, and celebration patterns.
 *
 * @param {Array<{style: 'light'|'medium'|'heavy', delay?: number}>} steps
 *   Each step fires a haptic impact after `delay` ms (default 0 for first, 80ms for rest).
 *
 * @example
 *   // Ramp up (like a celebration)
 *   hapticPattern([
 *     { style: "light" },
 *     { style: "medium", delay: 80 },
 *     { style: "heavy", delay: 80 },
 *   ]);
 *
 *   // Double bump (confirm save)
 *   hapticPattern([
 *     { style: "medium" },
 *     { style: "light", delay: 100 },
 *   ]);
 */
export const hapticPattern = async (steps) => {
  if (!isNative || !Array.isArray(steps)) return;
  for (let i = 0; i < steps.length; i++) {
    const { style = "light", delay = i === 0 ? 0 : 80 } = steps[i];
    if (delay > 0) await new Promise((r) => setTimeout(r, delay));
    try {
      await Haptics.impact({ style: STYLE_MAP[style] ?? ImpactStyle.Light });
    } catch (error) {
      console.error("[Haptics] Pattern step failed:", error?.message ?? error);
    }
  }
};

/**
 * Notification-style haptic (success, warning, error).
 * Uses the device's dedicated notification actuator.
 * @param {'success' | 'warning' | 'error'} type
 */
export const triggerNotificationHaptic = async (type = "success") => {
  if (!isNative) return;
  const typeMap = {
    success: NotificationType.Success,
    warning: NotificationType.Warning,
    error: NotificationType.Error,
  };
  try {
    await Haptics.notification({ type: typeMap[type] ?? NotificationType.Success });
  } catch (error) {
    console.error("[Haptics] Notification failed:", error?.message ?? error);
  }
};

