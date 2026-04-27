"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { SignIn } from "@clerk/nextjs";
import Link from "next/link";
import { useAuthModal } from "../lib/authModalContext";

export default function AuthModal() {
  const { isOpen, close, authImage } = useAuthModal();
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      setShow(false);
      return;
    }
    const t = setTimeout(() => setShow(true), 10);
    return () => clearTimeout(t);
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e) => {
      if (e.key === "Escape") close();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isOpen, close]);

  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100]">
      {/* Backdrop */}
      <div
        className={`absolute inset-0 bg-navy/50 transition-opacity duration-300 ${
          show ? "opacity-100" : "opacity-0"
        }`}
        onClick={close}
      />

      {/* Modal — two perfect squares side-by-side on desktop, stacked on mobile */}
      <div className="absolute inset-0 flex items-center justify-center p-4 pointer-events-none overflow-y-auto">
        <div
          className={`relative w-[min(90vw,340px)] md:w-[680px] md:h-[340px] bg-white shadow-2xl overflow-hidden flex flex-col md:flex-row pointer-events-auto transition-all duration-300 ${
            show
              ? "opacity-100 scale-100 translate-y-0"
              : "opacity-0 scale-[0.96] translate-y-4"
          }`}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Close button */}
          <button
            onClick={close}
            className="absolute top-2 right-2 z-30 w-7 h-7 bg-white/90 flex items-center justify-center text-navy hover:bg-white transition-colors"
          >
            <span className="material-symbols-outlined text-[16px]">close</span>
          </button>

          {/* Image Section — square */}
          <div className="relative w-full aspect-square md:w-[340px] md:h-[340px] bg-navy flex-shrink-0">
            <Image
              src={authImage}
              alt="Welcome to SWARNIKA"
              fill
              priority
              className="object-cover object-top md:object-center"
              sizes="(max-width: 768px) 340px, 340px"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-navy/70 via-navy/10 to-transparent" />
            <div className="absolute bottom-3 left-3 md:bottom-5 md:left-5 z-10">
              <Link href="/" onClick={close} className="inline-block">
                <Image
                  src="/products/logo.svg"
                  alt="SWARNIKA"
                  width={100}
                  height={50}
                  className="w-12 md:w-14 h-auto"
                />
              </Link>
            </div>
          </div>

          {/* Form Section — square, no scroll */}
          <div className="w-full aspect-square md:w-[340px] md:h-[340px] overflow-hidden bg-background">
            <SignIn
              routing="hash"
              signUpUrl="/sign-up"
              fallbackRedirectUrl="/"
              appearance={{
                elements: {
                  rootBox: { width: "94%" },
                  card: {
                    backgroundColor: "transparent",
                    boxShadow: "none",
                    border: "none",
                    borderRadius: "0",
                    padding: "8px 12px 0",
                    margin: "0",
                    width: "100%",
                    maxWidth: "100%",
                  },
                  header: { padding: "0 0 6px", margin: "0", marginTop: "10px" },
                  headerTitle: { fontSize: "24px", fontWeight: "400", fontStyle: "italic", fontFamily: "var(--font-headline)", color: "#0f172a" },
                  headerSubtitle: { fontSize: "10px", color: "#64748b", marginTop: "2px" },
                  main: { padding: "0", gap: "3px", margin: "0", width: "100%" },
                  socialButtons: { display: "flex", flexDirection: "column", gap: "4px", width: "100%", margin: "0" },
                  socialButtonsBlockButton: {
                    width: "94%",
                    height: "28px",
                    fontSize: "10px",
                    padding: "0 8px",
                    boxSizing: "border-box",
                    border: "1px solid black"
                  },
                  socialButtonsBlockButtonText: { fontSize: "10px" },
                  footer: { marginTop: "4px", paddingBottom: "10px" },
                  footerAction: { fontSize: "10px" },
                  footerActionLink: { fontSize: "10px" },
                  formFieldLabel: { fontSize: "10px", marginBottom: "1px", letterSpacing: "0.05em" },
                  formFieldInput: { fontSize: "11px", padding: "4px 8px", height: "28px", boxSizing: "border-box", width: "94%" },
                  formButtonPrimary: {
                    fontSize: "11px",
                    height: "28px",
                    padding: "0  0px",
                    marginLeft: "-20px",
                    width: "94%",
                    boxSizing: "content-box",
                    backgroundColor: "#C9A44A",
                    border: "0px"
                  },
                  alternativeMethodsBlockButton: { fontSize: "10px", height: "24px", padding: "0 6px" },
                  dividerLine: { margin: "4px 0" },
                  dividerText: { fontSize: "9px" },
                  identityPreview: { fontSize: "10px", padding: "4px 8px" },
                  identityPreviewText: { fontSize: "10px" },
                  identityPreviewEditButton: { fontSize: "10px" },
                  alert: { fontSize: "10px", padding: "6px 8px" },
                  alertText: { fontSize: "10px" },
                },
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
