import { Capacitor } from "@capacitor/core";
import { PushNotifications } from "@capacitor/push-notifications";

const isNative = Capacitor.isNativePlatform();

/**
 * Initialises Firebase push notifications via Capacitor.
 * Safe to call on web — exits immediately if not running natively.
 *
 * @param {string} authToken  - JWT from Redux auth state
 */
export async function initPushNotifications(authToken) {
  if (!isNative) return;

  // Request OS permission
  const permResult = await PushNotifications.requestPermissions();
  if (permResult.receive !== "granted") {
    console.warn("[FCM] Permission denied");
    return;
  }

  // Trigger FCM registration
  await PushNotifications.register();

  // Token obtained — POST to backend
  PushNotifications.addListener("registration", async (token) => {
    console.log("[FCM] Token:", token.value);
    try {
      const baseUrl = (import.meta.env.VITE_BACKEND_URL || "http://localhost:3000/api").replace(/\/api$/, "");
      await fetch(`${baseUrl}/api/notifications/register-token`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify({ fcmToken: token.value }),
      });
    } catch (err) {
      console.error("[FCM] Failed to register token with backend:", err);
    }
  });

  // Registration failed
  PushNotifications.addListener("registrationError", (err) => {
    console.error("[FCM] Registration error:", err);
  });

  // Notification received while app is in foreground
  PushNotifications.addListener("pushNotificationReceived", (notification) => {
    console.log("[FCM] Foreground notification:", notification);
    // In-app toast/banner can be triggered here in the future
  });

  // User tapped the notification (app was background/closed)
  PushNotifications.addListener("pushNotificationActionPerformed", (action) => {
    const data = action.notification.data;
    if (data?.url) {
      window.location.href = data.url;
    }
  });
}
