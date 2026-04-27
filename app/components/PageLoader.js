"use client";

import { useEffect, useState, useRef } from "react";
import { usePageLoading } from "../lib/loadingContext";

export default function PageLoader() {
  const { isLoading, isExiting, stopLoading } = usePageLoading();
  const [mounted, setMounted] = useState(false);
  const autoStopTimer = useRef(null);
  const isInitialMount = useRef(true);

  useEffect(() => {
    setMounted(true);
    // Auto-stop after a short delay on every mount.
    // If a page calls startLoading() before this fires, the timer is cancelled.
    autoStopTimer.current = setTimeout(() => {
      stopLoading();
    }, 1500);
    return () => {
      if (autoStopTimer.current) clearTimeout(autoStopTimer.current);
    };
  }, [stopLoading]);

  // Cancel auto-stop whenever something explicitly starts loading
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }
    if (isLoading && autoStopTimer.current) {
      clearTimeout(autoStopTimer.current);
      autoStopTimer.current = null;
    }
  }, [isLoading]);

  if (!mounted) return null;
  if (!isLoading && !isExiting) return null;

  return (
    <div
      className={`fixed inset-0 z-[9999] flex items-center justify-center ${
        isExiting ? "opacity-0" : "opacity-100"
      }`}
      style={{
        background: "rgba(255, 248, 239, 0.92)",
        backdropFilter: "blur(8px)",
        WebkitBackdropFilter: "blur(8px)",
        clipPath: isExiting
          ? "inset(100% 0 0 0)"
          : "inset(0 0 0 0)",
        transition: "clip-path 1.2s cubic-bezier(0.65, 0, 0.35, 1), opacity 0.6s ease-out 0.8s",
      }}
    >
      {/* Brand mark */}
      <div className="flex flex-col items-center gap-4">
        <img
          src="/products/logo.svg"
          alt="SWARNIKA"
          className="w-32 md:w-40 h-auto"
          style={{ opacity: isExiting ? 0 : 1, transition: "opacity 0.4s ease" }}
        />
        <div className="w-12 h-[1px] bg-gold-light" />
        <span
          className="font-label text-[10px] tracking-[0.3em] uppercase text-outline"
          style={{ opacity: isExiting ? 0 : 1, transition: "opacity 0.4s ease" }}
        >
          Where Fashion Meets Beauty
        </span>
      </div>
    </div>
  );
}
