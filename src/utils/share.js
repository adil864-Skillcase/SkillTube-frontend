import { Capacitor } from "@capacitor/core";

/**
 * Generates a shareable URL that works for mobile (Intent links) and web fallback.
 * 
 * @param {string} path - The path to share (e.g., "/player/slug?v=123")
 * @returns {string} - The constructed URL
 */
export const getShareUrl = (path) => {
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  
  // Replace this with the actual production domain when available
  const PRODUCTION_DOMAIN = "https://skillsnap.app"; // Fallback URL for non-android/desktop
  
  if (Capacitor.getPlatform() === "android") {
    // Android Intent URL: attempts to open the app, otherwise goes to Play Store
    // Scheme must match the intent-filter in AndroidManifest.xml
    return `intent://app${cleanPath}#Intent;scheme=skillsnap;package=com.skillsnap.app;end`;
  }
  
  // For iOS / Web, use the production domain if we have one, otherwise fallback to origin
  const origin = window.location.origin.includes("localhost") 
    ? PRODUCTION_DOMAIN 
    : window.location.origin;
    
  return `${origin}${cleanPath}`;
};
