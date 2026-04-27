"use client";

import { useEffect } from "react";
import { usePageLoading } from "../lib/loadingContext";

/**
 * Drop this component into any page that is fully server-rendered
 * (no client-side data fetching). It signals the page loader to fade out
 * once React has hydrated and painted.
 */
export default function PageReady({ delay = 300 }) {
  const { stopLoading } = usePageLoading();

  useEffect(() => {
    const timer = setTimeout(() => {
      stopLoading();
    }, delay);
    return () => clearTimeout(timer);
  }, [stopLoading, delay]);

  return null;
}
