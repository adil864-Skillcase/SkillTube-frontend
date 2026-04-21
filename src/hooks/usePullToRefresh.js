import { useState, useRef, useCallback } from "react";
import { triggerHaptic } from "../utils/haptics";

const THRESHOLD = 80;   // px to pull before triggering refresh
const MAX_PULL = 120;   // max visual drag distance in px

/**
 * Attaches native-feel pull-to-refresh behaviour to any scrollable container.
 *
 * Usage:
 *   const { pullProgress, isRefreshing, containerProps } = usePullToRefresh(onRefresh);
 *
 * - Spread `containerProps` onto the scrollable wrapper div.
 * - Use `pullProgress` (0–1) and `isRefreshing` to drive the indicator UI.
 * - `onRefresh` should return a Promise.
 */
export function usePullToRefresh(onRefresh) {
  const [pullDistance, setPullDistance] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const startY = useRef(null);
  const pulling = useRef(false);
  const hapticFired = useRef(false);

  const onTouchStart = useCallback((e) => {
    // Only activate when scrolled to the very top
    const el = e.currentTarget;
    if (el.scrollTop > 0) return;
    startY.current = e.touches[0].clientY;
    pulling.current = true;
    hapticFired.current = false;
  }, []);

  const onTouchMove = useCallback((e) => {
    if (!pulling.current || startY.current === null) return;
    const delta = e.touches[0].clientY - startY.current;
    if (delta <= 0) {
      setPullDistance(0);
      return;
    }

    // Apply resistance — feels more natural
    const resistance = 0.45;
    const clamped = Math.min(delta * resistance, MAX_PULL);
    setPullDistance(clamped);

    if (clamped >= THRESHOLD * resistance && !hapticFired.current) {
      triggerHaptic("light");
      hapticFired.current = true;
    }
  }, []);

  const onTouchEnd = useCallback(async () => {
    if (!pulling.current) return;
    pulling.current = false;
    startY.current = null;

    const threshold = THRESHOLD * 0.45; // matches resistance above
    if (pullDistance >= threshold && !isRefreshing) {
      triggerHaptic("medium");
      setIsRefreshing(true);
      setPullDistance(0);
      try {
        await onRefresh();
      } finally {
        setIsRefreshing(false);
      }
    } else {
      setPullDistance(0);
    }
  }, [pullDistance, isRefreshing, onRefresh]);

  const pullProgress = Math.min(pullDistance / (THRESHOLD * 0.45), 1);

  return {
    pullProgress,
    pullDistance,
    isRefreshing,
    containerProps: {
      onTouchStart,
      onTouchMove,
      onTouchEnd,
      style: {
        transform: pullDistance > 0 ? `translateY(${pullDistance}px)` : undefined,
        transition: !pulling.current ? "transform 0.3s ease" : "none",
        willChange: "transform",
      },
    },
  };
}
