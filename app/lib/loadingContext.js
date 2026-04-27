"use client";

import { createContext, useContext, useState, useCallback, useRef, useEffect } from "react";

const LoadingContext = createContext(null);

export function LoadingProvider({ children }) {
  const [isLoading, setIsLoading] = useState(true);
  const [isExiting, setIsExiting] = useState(false);
  const [canRemove, setCanRemove] = useState(false);
  const timerRef = useRef(null);

  const startLoading = useCallback(() => {
    setCanRemove(false);
    setIsExiting(false);
    setIsLoading(true);
  }, []);

  const stopLoading = useCallback(() => {
    setIsExiting(true);
    // Wait for the CSS exit animation (1.2s) then fully remove
    timerRef.current = setTimeout(() => {
      setIsLoading(false);
      setCanRemove(true);
    }, 1200);
  }, []);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  return (
    <LoadingContext.Provider value={{ isLoading, isExiting, canRemove, startLoading, stopLoading }}>
      {children}
    </LoadingContext.Provider>
  );
}

export function usePageLoading() {
  const ctx = useContext(LoadingContext);
  if (!ctx) throw new Error("usePageLoading must be inside LoadingProvider");
  return ctx;
}
