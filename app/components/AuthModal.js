"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { SignIn, SignUp } from "@clerk/nextjs";
import { useAuth } from "@clerk/nextjs";
import Link from "next/link";
import { useAuthModal } from "../lib/authModalContext";

export default function AuthModal() {
  const { isOpen, close, authImage, mode, openSignIn, openSignUp } = useAuthModal();
  const { isSignedIn } = useAuth();
  const [show, setShow] = useState(false);

  // Auto-close modal when user finishes signing in
  useEffect(() => {
    if (isSignedIn && isOpen) close();
  }, [isSignedIn, isOpen, close]);

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

  // Fix checkbox layout on reset password step — apply inline styles
  // directly since Clerk's class names don't match our CSS selectors
  useEffect(() => {
    if (!isOpen) return;

    const fixCheckbox = () => {
      const container = document.querySelector(".auth-modal-clerk");
      if (!container) return;

      container.querySelectorAll('input[type="checkbox"]').forEach((cb) => {
        cb.style.width = "14px";
        cb.style.height = "14px";
        cb.style.minWidth = "14px";
        cb.style.flexShrink = "0";
        cb.style.margin = "0";
        cb.style.accentColor = "#C9A44A";

        // Only style the immediate wrapper (label) of the checkbox
        const label = cb.closest("label") || cb.parentElement;
        if (label && label !== container) {
          label.style.display = "flex";
          label.style.flexDirection = "row";
          label.style.alignItems = "center";
          label.style.gap = "6px";
          label.style.width = "94%";
          label.style.margin = "0 auto";
          label.style.fontSize = "9px";
          label.style.lineHeight = "1.2";
        }

        // Style sibling text nodes
        const textEl = cb.nextElementSibling || label?.querySelector("span, p, div");
        if (textEl) {
          textEl.style.fontSize = "9px";
          textEl.style.lineHeight = "1.2";
        }
      });
    };

    const observer = new MutationObserver(fixCheckbox);
    observer.observe(document.body, { childList: true, subtree: true });
    fixCheckbox();

    return () => observer.disconnect();
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100]">
      {/* Per-step button margin isolation — scoped to .auth-modal-clerk */}
      <style>{`
        .auth-modal-clerk .cl-signIn-start .cl-formButtonPrimary {
          margin-left: -20px !important;
        }
        .auth-modal-clerk .cl-signIn-password .cl-formButtonPrimary {
          margin-left: 0px !important;
        }

        /* Prevent button collapsing to circle during loading */
        .auth-modal-clerk .cl-formButtonPrimary[data-loading],
        .auth-modal-clerk .cl-formButtonPrimary:disabled {
          border-radius: 0 !important;
          width: 94% !important;
          min-width: unset !important;
        }

        /* Set new password step — tighten spacing to fit 340px height */
        .auth-modal-clerk .cl-signIn-resetPassword .cl-main {
          gap: 2px !important;
        }
        .auth-modal-clerk .cl-signIn-resetPassword .cl-formFieldRow {
          margin-bottom: 2px !important;
        }

        /* Password success/validation messages — shrink them */
        .auth-modal-clerk .cl-formFieldSuccessText,
        .auth-modal-clerk .cl-formFieldInfoText {
          font-size: 9px !important;
        }

        /* Reset password step — compress header */
        .auth-modal-clerk .cl-signIn-resetPassword .cl-header {
          padding-bottom: 4px !important;
          margin-top: 6px !important;
        }
        .auth-modal-clerk .cl-signIn-resetPassword .cl-headerTitle {
          font-size: 18px !important;
          margin-bottom: 0 !important;
        }
        .auth-modal-clerk .cl-signIn-resetPassword .cl-headerSubtitle {
          font-size: 9px !important;
          margin-top: 0 !important;
        }

        /* Reset password step — compress fields */
        .auth-modal-clerk .cl-signIn-resetPassword .cl-formFieldLabel {
          font-size: 9px !important;
          margin-bottom: 0 !important;
        }
        .auth-modal-clerk .cl-signIn-resetPassword .cl-formFieldInput {
          height: 26px !important;
          font-size: 10px !important;
        }

        /* Reset password step — shrink checkbox (broad fallback, MutationObserver handles the real fix) */
        .auth-modal-clerk input[type="checkbox"] {
          width: 14px !important;
          height: 14px !important;
          min-width: 14px !important;
          flex-shrink: 0 !important;
          accent-color: #C9A44A !important;
        }

        /* Force primary button to full width on reset step */
        .auth-modal-clerk .cl-signIn-resetPassword .cl-formButtonPrimary {
          margin-left: 0px !important;
          width: 94% !important;
          border-radius: 0 !important;
        }

        /* Reset password step — shrink the alert/info banner */
        .auth-modal-clerk .cl-signIn-resetPassword .cl-alert,
        .auth-modal-clerk .cl-signIn-resetPassword .cl-alertText {
          font-size: 9px !important;
          padding: 4px 6px !important;
          margin-bottom: 0 !important;
        }
      `}</style>

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
          <div className="flex flex-col">
            <div className="w-full aspect-square md:w-[340px] md:h-[340px] overflow-y-auto overflow-x-hidden bg-background">
              {mode === "signIn" ? (
                /* Wrapper div scopes the per-step CSS above to SignIn only */
                <div className="auth-modal-clerk">
                  <SignIn
                    routing="hash"
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
                          border: "1px solid black",
                        },
                        socialButtonsBlockButtonText: { fontSize: "10px" },
                        footer: { marginTop: "4px", paddingBottom: "0" },
                        footerAction: { display: "none" },
                        footerActionLink: { display: "none" },
                        formFieldLabel: { fontSize: "10px", marginBottom: "1px", letterSpacing: "0.05em" },
                        formFieldInput: { fontSize: "11px", padding: "4px 8px", height: "28px", boxSizing: "border-box", width: "94%" },
                        formFieldAction: { fontSize: "9px" },
                        formFieldLabelRow: { paddingRight: "6%" },
                        formFieldInputShowPasswordButton: { right: "4%" },
                        formButtonPrimary: {
                          // marginLeft intentionally omitted — handled per-step via .auth-modal-clerk CSS above
                          fontSize: "11px",
                          height: "28px",
                          padding: "0 0px",
                          width: "94%",
                          boxSizing: "content-box",
                          backgroundColor: "#C9A44A",
                          border: "0px",
                          borderRadius: "0",
                        },
                        alternativeMethodsBlockButton: { fontSize: "10px", height: "24px", padding: "0 6px" },
                        dividerLine: { margin: "4px 0" },
                        dividerText: { fontSize: "9px" },
                        identityPreview: { fontSize: "10px", padding: "4px 8px" },
                        identityPreviewText: { fontSize: "10px" },
                        identityPreviewEditButton: { fontSize: "10px" },
                        alert: { fontSize: "10px", padding: "6px 8px" },
                        alertText: { fontSize: "10px" },
                        formFieldSuccessText: { fontSize: "9px" },
                        formFieldInfoText: { fontSize: "9px" },
                        formFieldCheckboxWrapper: { display: "flex", flexDirection: "row", alignItems: "center", gap: "4px", width: "94%" },
                      },
                    }}
                  />
                </div>
              ) : (
                <SignUp
                  routing="hash"
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
                        border: "1px solid black",
                      },
                      socialButtonsBlockButtonText: { fontSize: "10px" },
                      footer: { marginTop: "4px", paddingBottom: "0" },
                      footerAction: { display: "none" },
                      footerActionLink: { display: "none" },
                      formFieldLabel: { fontSize: "10px", marginBottom: "1px", letterSpacing: "0.05em" },
                      formFieldInput: { fontSize: "11px", padding: "4px 8px", height: "28px", boxSizing: "border-box", width: "94%" },
formButtonPrimary: {
                         fontSize: "11px",
                         height: "28px",
                         padding: "0 0px",
                         marginLeft: "0px",
                         width: "94%",
                         boxSizing: "content-box",
                         backgroundColor: "#C9A44A",
                         border: "0px",
                         borderRadius: "0",
                       },
                      formFieldInputShowPasswordButton: { right: "4%" },
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
              )}
            </div>

            {/* Custom Footer Toggle */}
            <div className="px-5 py-2.5 text-center border-t border-gray-200 shrink-0 bg-background">
              {mode === "signUp" ? (
                <p className="text-[11px] text-gray-500">
                  Already have an account?{" "}
                  <button
                    onClick={openSignIn}
                    className="text-[#C9A44A] font-semibold hover:underline transition-colors"
                  >
                    Sign in
                  </button>
                </p>
              ) : (
                <p className="text-[11px] text-gray-500">
                  Don&apos;t have an account?{" "}
                  <button
                    onClick={openSignUp}
                    className="text-[#C9A44A] font-semibold hover:underline transition-colors"
                  >
                    Sign up
                  </button>
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}