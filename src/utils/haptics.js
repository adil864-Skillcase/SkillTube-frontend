import { Capacitor } from "@capacitor/core";
import { Haptics, ImpactStyle } from "@capacitor/haptics";

const isNative = Capacitor.isNativePlatform();

/**
 * Triggers a haptic feedback pattern on the device.
 * Uses the native Capacitor Haptics plugin — only works in a native Android/iOS build.
 * Silently no-ops on web.
 *
 * @param {'light' | 'medium' | 'heavy'} style - The intensity of the feedback
 */
export const triggerHaptic = async (style = "light") => {
  if (!isNative) return;

  try {
    let impactStyle;
    switch (style) {
      case "heavy":
        impactStyle = ImpactStyle.Heavy;
        break;
      case "medium":
        impactStyle = ImpactStyle.Medium;
        break;
      case "light":
      default:
        impactStyle = ImpactStyle.Light;
        break;
    }
    await Haptics.impact({ style: impactStyle });
  } catch (error) {
    // Log the real error so we can diagnose plugin registration issues
    console.error("[Haptics] Failed:", error?.message ?? error);
  }
};

