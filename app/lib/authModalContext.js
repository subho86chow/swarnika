"use client";

import { createContext, useContext, useState, useCallback, useEffect } from "react";

const AuthModalContext = createContext(null);

export function AuthModalProvider({ children }) {
  const [isOpen, setIsOpen] = useState(false);
  const [mode, setMode] = useState("signIn"); // "signIn" | "signUp"
  const [authImage, setAuthImage] = useState("/products/product-5.jpg");

  // Pre-fetch auth image once on mount so it's ready before modal opens
  useEffect(() => {
    fetch("/api/site-content?key=auth_image", { cache: "no-store" })
      .then((res) => res.json())
      .then((data) => {
        if (data?.value) setAuthImage(data.value);
      })
      .catch(() => {});
  }, []);

  const openSignIn = useCallback(() => {
    setMode("signIn");
    setIsOpen(true);
  }, []);

  const openSignUp = useCallback(() => {
    setMode("signUp");
    setIsOpen(true);
  }, []);

  const close = useCallback(() => {
    setIsOpen(false);
  }, []);

  return (
    <AuthModalContext.Provider
      value={{ isOpen, mode, authImage, openSignIn, openSignUp, close }}
    >
      {children}
    </AuthModalContext.Provider>
  );
}

export function useAuthModal() {
  const ctx = useContext(AuthModalContext);
  if (!ctx) throw new Error("useAuthModal must be inside AuthModalProvider");
  return ctx;
}
