"use client";

import { useAuth, useClerk } from "@clerk/nextjs";
import { useEffect } from "react";

export default function AuthGuard({ children }) {
  const { isLoaded, userId } = useAuth();
  const { openSignIn } = useClerk();

  useEffect(() => {
    if (isLoaded && !userId) {
      openSignIn();
    }
  }, [isLoaded, userId, openSignIn]);

  if (!isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-4">
          <div className="w-8 h-8 border-2 border-gold-light border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="font-body text-outline text-sm">Loading...</p>
        </div>
      </div>
    );
  }

  if (!userId) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background pt-[136px]">
        <div className="text-center space-y-6 px-6">
          <span className="material-symbols-outlined text-outline-var text-[48px]">lock</span>
          <h2 className="font-headline text-2xl text-navy italic">Sign in to continue</h2>
          <p className="text-outline text-[13px] leading-relaxed max-w-sm mx-auto">
            Please sign in to access this page.
          </p>
          <button onClick={() => openSignIn()} className="btn-primary">
            Sign In
          </button>
        </div>
      </div>
    );
  }

  return children;
}
